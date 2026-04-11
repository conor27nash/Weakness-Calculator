/**
 * Static test fixtures derived from desktop/backend/data/csv/.
 * Only includes Pokemon needed for tests: Bulbasaur line, Charizard, Eevee + eeveelutions.
 */

// ---------------------------------------------------------------------------
// Type endpoint responses (GET /api/v2/type/{name})
// Each returns { pokemon: [{ pokemon: { name, url }, slot }] }
// ---------------------------------------------------------------------------

interface TypeSlotEntry {
  pokemon: { name: string; url: string };
  slot: number;
}

function entry(name: string, id: number, slot: number): TypeSlotEntry {
  return { pokemon: { name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` }, slot };
}

export const TYPE_RESPONSES: Record<string, { pokemon: TypeSlotEntry[] }> = {
  normal:   { pokemon: [entry("eevee", 133, 1)] },
  fire:     { pokemon: [entry("charizard", 6, 1), entry("flareon", 136, 1)] },
  water:    { pokemon: [entry("vaporeon", 134, 1)] },
  electric: { pokemon: [entry("jolteon", 135, 1)] },
  grass:    { pokemon: [entry("bulbasaur", 1, 1), entry("ivysaur", 2, 1), entry("venusaur", 3, 1)] },
  ice:      { pokemon: [] },
  fighting: { pokemon: [] },
  poison:   { pokemon: [entry("bulbasaur", 1, 2), entry("ivysaur", 2, 2), entry("venusaur", 3, 2)] },
  ground:   { pokemon: [] },
  flying:   { pokemon: [entry("charizard", 6, 2)] },
  psychic:  { pokemon: [] },
  bug:      { pokemon: [] },
  rock:     { pokemon: [] },
  ghost:    { pokemon: [] },
  dragon:   { pokemon: [] },
  dark:     { pokemon: [] },
  steel:    { pokemon: [] },
  fairy:    { pokemon: [] },
};

// ---------------------------------------------------------------------------
// Pokemon detail responses (GET /api/v2/pokemon/{name})
// ---------------------------------------------------------------------------

function pokemonResponse(
  id: number,
  name: string,
  types: { slot: number; name: string }[],
  stats: { name: string; base_stat: number }[],
  abilities: { name: string; id: number; hidden: boolean }[],
  height: number,
  weight: number,
) {
  return {
    id,
    name,
    height,
    weight,
    types: types.map((t) => ({ slot: t.slot, type: { name: t.name } })),
    stats: stats.map((s) => ({ stat: { name: s.name }, base_stat: s.base_stat })),
    abilities: abilities.map((a) => ({
      ability: { name: a.name, url: `https://pokeapi.co/api/v2/ability/${a.id}/` },
      is_hidden: a.hidden,
    })),
  };
}

export const POKEMON_RESPONSES: Record<string, ReturnType<typeof pokemonResponse>> = {
  bulbasaur: pokemonResponse(1, "bulbasaur",
    [{ slot: 1, name: "grass" }, { slot: 2, name: "poison" }],
    [
      { name: "hp", base_stat: 45 }, { name: "attack", base_stat: 49 },
      { name: "defense", base_stat: 49 }, { name: "special-attack", base_stat: 65 },
      { name: "special-defense", base_stat: 65 }, { name: "speed", base_stat: 45 },
    ],
    [{ name: "overgrow", id: 65, hidden: false }, { name: "chlorophyll", id: 34, hidden: true }],
    7, 69,
  ),
  ivysaur: pokemonResponse(2, "ivysaur",
    [{ slot: 1, name: "grass" }, { slot: 2, name: "poison" }],
    [
      { name: "hp", base_stat: 60 }, { name: "attack", base_stat: 62 },
      { name: "defense", base_stat: 63 }, { name: "special-attack", base_stat: 80 },
      { name: "special-defense", base_stat: 80 }, { name: "speed", base_stat: 60 },
    ],
    [{ name: "overgrow", id: 65, hidden: false }, { name: "chlorophyll", id: 34, hidden: true }],
    10, 130,
  ),
  venusaur: pokemonResponse(3, "venusaur",
    [{ slot: 1, name: "grass" }, { slot: 2, name: "poison" }],
    [
      { name: "hp", base_stat: 80 }, { name: "attack", base_stat: 82 },
      { name: "defense", base_stat: 83 }, { name: "special-attack", base_stat: 100 },
      { name: "special-defense", base_stat: 100 }, { name: "speed", base_stat: 80 },
    ],
    [{ name: "overgrow", id: 65, hidden: false }, { name: "chlorophyll", id: 34, hidden: true }],
    20, 1000,
  ),
  charizard: pokemonResponse(6, "charizard",
    [{ slot: 1, name: "fire" }, { slot: 2, name: "flying" }],
    [
      { name: "hp", base_stat: 78 }, { name: "attack", base_stat: 84 },
      { name: "defense", base_stat: 78 }, { name: "special-attack", base_stat: 109 },
      { name: "special-defense", base_stat: 85 }, { name: "speed", base_stat: 100 },
    ],
    [{ name: "blaze", id: 66, hidden: false }, { name: "solar-power", id: 94, hidden: true }],
    17, 905,
  ),
  eevee: pokemonResponse(133, "eevee",
    [{ slot: 1, name: "normal" }],
    [
      { name: "hp", base_stat: 55 }, { name: "attack", base_stat: 55 },
      { name: "defense", base_stat: 50 }, { name: "special-attack", base_stat: 45 },
      { name: "special-defense", base_stat: 65 }, { name: "speed", base_stat: 55 },
    ],
    [{ name: "run-away", id: 50, hidden: false }, { name: "adaptability", id: 91, hidden: false }, { name: "anticipation", id: 107, hidden: true }],
    3, 65,
  ),
  vaporeon: pokemonResponse(134, "vaporeon",
    [{ slot: 1, name: "water" }],
    [
      { name: "hp", base_stat: 130 }, { name: "attack", base_stat: 65 },
      { name: "defense", base_stat: 60 }, { name: "special-attack", base_stat: 110 },
      { name: "special-defense", base_stat: 95 }, { name: "speed", base_stat: 65 },
    ],
    [{ name: "water-absorb", id: 11, hidden: false }, { name: "hydration", id: 93, hidden: true }],
    10, 290,
  ),
  jolteon: pokemonResponse(135, "jolteon",
    [{ slot: 1, name: "electric" }],
    [
      { name: "hp", base_stat: 65 }, { name: "attack", base_stat: 65 },
      { name: "defense", base_stat: 60 }, { name: "special-attack", base_stat: 110 },
      { name: "special-defense", base_stat: 95 }, { name: "speed", base_stat: 130 },
    ],
    [{ name: "volt-absorb", id: 10, hidden: false }, { name: "quick-feet", id: 95, hidden: true }],
    8, 245,
  ),
  flareon: pokemonResponse(136, "flareon",
    [{ slot: 1, name: "fire" }],
    [
      { name: "hp", base_stat: 65 }, { name: "attack", base_stat: 130 },
      { name: "defense", base_stat: 60 }, { name: "special-attack", base_stat: 95 },
      { name: "special-defense", base_stat: 110 }, { name: "speed", base_stat: 65 },
    ],
    [{ name: "flash-fire", id: 18, hidden: false }, { name: "guts", id: 62, hidden: true }],
    9, 250,
  ),
};

// ---------------------------------------------------------------------------
// Species responses (GET /api/v2/pokemon-species/{name})
// ---------------------------------------------------------------------------

export const SPECIES_RESPONSES: Record<string, { evolution_chain: { url: string } }> = {
  bulbasaur: { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" } },
  ivysaur:   { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" } },
  venusaur:  { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" } },
  charizard: { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/2/" } },
  eevee:     { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/67/" } },
  vaporeon:  { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/67/" } },
  jolteon:   { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/67/" } },
  flareon:   { evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/67/" } },
};

// ---------------------------------------------------------------------------
// Ability responses (GET /api/v2/ability/{id})
// ---------------------------------------------------------------------------

function abilityResponse(shortEffect: string) {
  return {
    effect_entries: [
      { language: { name: "en" }, short_effect: shortEffect },
    ],
  };
}

export const ABILITY_RESPONSES: Record<string, ReturnType<typeof abilityResponse>> = {
  "10": abilityResponse("Absorbs electric moves, healing for 1/4 max HP."),
  "11": abilityResponse("Absorbs water moves, healing for 1/4 max HP."),
  "18": abilityResponse("Protects against fire moves. Once one has been blocked, the Pokémon's own Fire moves inflict 1.5× damage until it leaves battle."),
  "34": abilityResponse("Doubles Speed during strong sunlight."),
  "50": abilityResponse("Ensures success fleeing from wild battles."),
  "62": abilityResponse("Increases Attack to 1.5× with a major status ailment."),
  "65": abilityResponse("Strengthens grass moves to inflict 1.5× damage at 1/3 max HP or less."),
  "66": abilityResponse("Strengthens fire moves to inflict 1.5× damage at 1/3 max HP or less."),
  "91": abilityResponse("Increases the same-type attack bonus from 1.5× to 2×."),
  "93": abilityResponse("Cures any major status ailment after each turn during rain."),
  "94": abilityResponse("Increases Special Attack to 1.5× but costs 1/8 max HP after each turn during strong sunlight."),
  "95": abilityResponse("Increases Speed to 1.5× with a major status ailment."),
  "107": abilityResponse("Notifies all trainers upon entering battle if an opponent has a super-effective move, Self-Destruct, Explosion, or a one-hit KO move."),
};

// ---------------------------------------------------------------------------
// Evolution chain responses (GET /api/v2/evolution-chain/{id})
// ---------------------------------------------------------------------------

export const EVOLUTION_CHAIN_RESPONSES: Record<string, { chain: any }> = {
  // Chain 1: Bulbasaur → Ivysaur → Venusaur
  "1": {
    chain: {
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
      evolution_details: [],
      evolves_to: [{
        species: { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon-species/2/" },
        evolution_details: [{ trigger: { name: "level-up" }, min_level: 16 }],
        evolves_to: [{
          species: { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon-species/3/" },
          evolution_details: [{ trigger: { name: "level-up" }, min_level: 32 }],
          evolves_to: [],
        }],
      }],
    },
  },
  // Chain 2: Charmander → Charmeleon → Charizard
  "2": {
    chain: {
      species: { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon-species/4/" },
      evolution_details: [],
      evolves_to: [{
        species: { name: "charmeleon", url: "https://pokeapi.co/api/v2/pokemon-species/5/" },
        evolution_details: [{ trigger: { name: "level-up" }, min_level: 16 }],
        evolves_to: [{
          species: { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon-species/6/" },
          evolution_details: [{ trigger: { name: "level-up" }, min_level: 36 }],
          evolves_to: [],
        }],
      }],
    },
  },
  // Chain 67: Eevee → Vaporeon/Jolteon/Flareon (branching)
  "67": {
    chain: {
      species: { name: "eevee", url: "https://pokeapi.co/api/v2/pokemon-species/133/" },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: "vaporeon", url: "https://pokeapi.co/api/v2/pokemon-species/134/" },
          evolution_details: [{ trigger: { name: "use-item" }, item: { name: "water-stone" } }],
          evolves_to: [],
        },
        {
          species: { name: "jolteon", url: "https://pokeapi.co/api/v2/pokemon-species/135/" },
          evolution_details: [{ trigger: { name: "use-item" }, item: { name: "thunder-stone" } }],
          evolves_to: [],
        },
        {
          species: { name: "flareon", url: "https://pokeapi.co/api/v2/pokemon-species/136/" },
          evolution_details: [{ trigger: { name: "use-item" }, item: { name: "fire-stone" } }],
          evolves_to: [],
        },
      ],
    },
  },
};
