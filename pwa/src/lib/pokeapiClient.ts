import type { Pokemon, PokemonDetail } from "../types";

const BASE = "https://pokeapi.co/api/v2";
const SPRITE = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const ALL_TYPE_NAMES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const CACHE_KEY = "pokeapi_pokemon_list_v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// In-memory caches
// ---------------------------------------------------------------------------
let pokemonListCache: Pokemon[] | null = null;
const detailCache = new Map<string, PokemonDetail>();

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
interface StoredPokemonList {
  ts: number;
  data: { id: number; name: string; types: string[] }[];
}

function loadFromStorage(): Pokemon[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: StoredPokemonList = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data.map((p) => ({ ...p, spriteUrl: SPRITE(p.id) }));
  } catch {
    return null;
  }
}

function saveToStorage(list: Pokemon[]): void {
  try {
    const payload: StoredPokemonList = {
      ts: Date.now(),
      data: list.map((p) => ({ id: p.id, name: p.name, types: p.types })),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage quota exceeded — skip
  }
}

// ---------------------------------------------------------------------------
// Build full Pokemon list from all 18 type endpoints in parallel
// ---------------------------------------------------------------------------
async function buildPokemonList(): Promise<Pokemon[]> {
  if (pokemonListCache) return pokemonListCache;

  const stored = loadFromStorage();
  if (stored) {
    pokemonListCache = stored;
    return stored;
  }

  const responses = await Promise.all(
    ALL_TYPE_NAMES.map((t) => fetch(`${BASE}/type/${t}`).then((r) => r.json()))
  );

  // Merge all 18 responses: collect { name, slot, typeName } per Pokemon ID
  type SlotEntry = { slot: number; typeName: string };
  const entryMap = new Map<number, { name: string; slots: SlotEntry[] }>();

  for (let i = 0; i < responses.length; i++) {
    const typeName = ALL_TYPE_NAMES[i];
    for (const entry of responses[i].pokemon) {
      const urlParts: string[] = entry.pokemon.url.split("/").filter(Boolean);
      const id = parseInt(urlParts[urlParts.length - 1], 10);
      // Skip alternate forms (mega, regional, etc.)
      if (isNaN(id) || id > 10000) continue;

      if (!entryMap.has(id)) {
        entryMap.set(id, { name: entry.pokemon.name, slots: [] });
      }
      entryMap.get(id)!.slots.push({ slot: entry.slot, typeName });
    }
  }

  const list: Pokemon[] = [];
  for (const [id, { name, slots }] of entryMap) {
    slots.sort((a, b) => a.slot - b.slot);
    list.push({
      id,
      name,
      spriteUrl: SPRITE(id),
      types: slots.map((s) => s.typeName),
    });
  }
  list.sort((a, b) => a.id - b.id);

  pokemonListCache = list;
  saveToStorage(list);
  return list;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchAllPokemon(): Promise<Pokemon[]> {
  return buildPokemonList();
}

export async function fetchPokemonByTypes(type1: string, type2?: string): Promise<Pokemon[]> {
  const all = await buildPokemonList();
  if (!type2) {
    return all.filter((p) => p.types.includes(type1));
  }
  return all.filter((p) => p.types.includes(type1) && p.types.includes(type2));
}

export async function fetchPokemonDetail(name: string): Promise<PokemonDetail> {
  if (detailCache.has(name)) return detailCache.get(name)!;

  // Fetch base data + species in parallel
  const [pokemon, species] = await Promise.all([
    fetch(`${BASE}/pokemon/${name}`).then((r) => r.json()),
    fetch(`${BASE}/pokemon-species/${name}`).then((r) => r.json()),
  ]);

  // Fetch ability descriptions in parallel
  const abilityData = await Promise.all(
    pokemon.abilities.map((a: any) =>
      fetch(a.ability.url).then((r) => r.json())
    )
  );

  // Fetch evolution chain
  const evoChainUrl: string = species.evolution_chain.url;
  const evoChain = await fetch(evoChainUrl).then((r) => r.json());

  const detail: PokemonDetail = {
    id: pokemon.id,
    name: pokemon.name,
    spriteUrl: SPRITE(pokemon.id),
    types: pokemon.types
      .sort((a: any, b: any) => a.slot - b.slot)
      .map((t: any) => t.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    stats: pokemon.stats.map((s: any) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: abilityData.map((ab: any, i: number) => ({
      name: pokemon.abilities[i].ability.name,
      description:
        ab.effect_entries?.find((e: any) => e.language.name === "en")?.short_effect ?? "",
    })),
    evolutions: parseEvolutionChain(evoChain.chain),
  };

  detailCache.set(name, detail);
  return detail;
}

// ---------------------------------------------------------------------------
// Evolution chain parser (mirrors backend/pokedb.go buildEvolutionChain)
// ---------------------------------------------------------------------------
interface EvoNode {
  species: { name: string; url: string };
  evolution_details: any[];
  evolves_to: EvoNode[];
}

function parseEvolutionChain(chain: EvoNode): { name: string; spriteUrl: string; method: string }[][] {
  const paths: { name: string; spriteUrl: string; method: string }[][] = [];

  function walk(node: EvoNode, currentPath: { name: string; spriteUrl: string; method: string }[]) {
    const urlParts = node.species.url.split("/").filter(Boolean);
    const speciesId = parseInt(urlParts[urlParts.length - 1], 10);

    const evo = {
      name: node.species.name,
      spriteUrl: SPRITE(speciesId),
      method: formatEvoDetails(node.evolution_details?.[0]),
    };
    const newPath = [...currentPath, evo];

    if (!node.evolves_to || node.evolves_to.length === 0) {
      paths.push(newPath);
    } else {
      for (const child of node.evolves_to) {
        walk(child, newPath);
      }
    }
  }

  walk(chain, []);
  return paths;
}

function formatEvoDetails(details: any): string {
  if (!details) return "";
  const trigger = details.trigger?.name;

  if (trigger === "level-up") {
    if (details.min_level) return `Level ${details.min_level}`;
    if (details.min_happiness) {
      return details.time_of_day
        ? `Happiness (${details.time_of_day})`
        : "Happiness";
    }
    if (details.known_move) return `Know ${details.known_move.name.replace(/-/g, " ")}`;
    if (details.known_move_type) return `Know ${details.known_move_type.name.replace(/-/g, " ")} move`;
    if (details.location) return `At ${details.location.name.replace(/-/g, " ")}`;
    return "Level up";
  }
  if (trigger === "use-item") {
    return details.item ? details.item.name.replace(/-/g, " ") : "Use item";
  }
  if (trigger === "trade") {
    return details.held_item
      ? `Trade holding ${details.held_item.name.replace(/-/g, " ")}`
      : "Trade";
  }
  return trigger ? trigger.replace(/-/g, " ") : "";
}
