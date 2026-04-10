import { useState, useMemo, useEffect, useRef } from "react";
import type { Pokemon, PokemonDetail } from "../types";
import type { TeamSlot } from "../hooks/useTeamBuilder";
import { GENERATIONS, TYPE_COLORS } from "../constants";
import { getPokemonDetail } from "../lib/dataLayer";

interface PokemonListProps {
  pokemon: Pokemon[];
  loading: boolean;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  onClearTypes: () => void;
  onAddToTeam: (slot: TeamSlot) => void;
  teamNames: string[];
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

function statColor(value: number): string {
  const ratio = Math.min(value / 255, 1);
  return `hsl(${ratio * 120}, 75%, 45%)`;
}

type SortOption = "id" | "name-asc" | "name-desc";

const PAGE_SIZE = 60;

function PokemonList({ pokemon, loading, selectedTypes, onTypesChange, onClearTypes, onAddToTeam, teamNames }: PokemonListProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [selectedGen, setSelectedGen] = useState(0);
  const [page, setPage] = useState(0);
  const searchClearedTypes = useRef(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Close detail panel when the selected pokemon is no longer in the list
  useEffect(() => {
    if (selected && !pokemon.some((p) => p.name === selected)) {
      setSelected(null);
      setDetail(null);
    }
  }, [pokemon, selected]);

  // Clear search when selected types change (but not when search triggered the clear)
  useEffect(() => {
    if (searchClearedTypes.current) {
      searchClearedTypes.current = false;
      return;
    }
    setSearchTerm("");
    setPage(0);
  }, [selectedTypes]);

  const filteredPokemon = useMemo(() => {
    const gen = GENERATIONS[selectedGen];
    let list = pokemon;

    if (gen.min > 0) {
      list = list.filter((p) => p.id >= gen.min && p.id <= gen.max);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.includes(term));
    }

    const sorted = [...list];
    if (sortBy === "name-asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      sorted.sort((a, b) => a.id - b.id);
    }

    return sorted;
  }, [pokemon, searchTerm, sortBy, selectedGen]);

  const totalPages = Math.ceil(filteredPokemon.length / PAGE_SIZE);
  const pagedPokemon = filteredPokemon.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleClick(name: string) {
    if (selected === name) {
      setSelected(null);
      setDetail(null);
      return;
    }

    setSelected(name);
    setDetail(null);
    setDetailLoading(true);

    getPokemonDetail(name)
      .then((data) => {
        setDetail(data);
        onTypesChange(data.types);
        setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      })
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }

  if (!loading && pokemon.length === 0) {
    return null;
  }

  return (
    <div className="pokemon-section">
      <h2>
        {loading
          ? "Loading Pokémon..."
          : selectedTypes.length > 0
            ? `Pokémon with this typing (${pokemon.length})`
            : `All Pokémon (${pokemon.length})`}
      </h2>

      {selected && (
        <div className="pokemon-detail" ref={detailRef}>
          <button className="detail-close" onClick={() => { setSelected(null); setDetail(null); }}>&times;</button>
          {detailLoading ? (
            <p className="hint">Loading details...</p>
          ) : detail ? (
            <>
              <div className="detail-header">
                <img src={detail.spriteUrl} alt={detail.name} />
                <div>
                  <h3>#{String(detail.id).padStart(3, "0")} {detail.name}</h3>
                  <div className="detail-type-pills">
                    {detail.types.map((t) => (
                      <span key={t} className="detail-type-pill" style={{ backgroundColor: TYPE_COLORS[t] }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    ))}
                  </div>
                  <p>Height: {detail.height / 10}m &middot; Weight: {detail.weight / 10}kg</p>
                </div>
                {!teamNames.includes(detail.name) ? (
                  <button
                    className="add-team-btn"
                    onClick={() =>
                      onAddToTeam({
                        name: detail.name,
                        types: detail.types,
                        spriteUrl: detail.spriteUrl,
                      })
                    }
                  >
                    + Add to Team
                  </button>
                ) : (
                  <span className="on-team-badge">On Team</span>
                )}
              </div>

              <div className="detail-abilities">
                <h4>Abilities</h4>
                {detail.abilities.map((a) => (
                  <div key={a.name} className="ability-item">
                    <span className="ability-name">{a.name}</span>
                    {a.description && <p className="ability-desc">{a.description}</p>}
                  </div>
                ))}
              </div>

              <div className="detail-stats">
                {detail.stats.map((s) => (
                  <div key={s.name} className="stat-row">
                    <span className="stat-label">{STAT_LABELS[s.name] ?? s.name}</span>
                    <div className="stat-bar-bg">
                      <div
                        className="stat-bar"
                        style={{
                          width: `${Math.min((s.value / 255) * 100, 100)}%`,
                          background: statColor(s.value),
                        }}
                      />
                    </div>
                    <span className="stat-value">{s.value}</span>
                  </div>
                ))}
              </div>

              {detail.evolutions.length > 0 && detail.evolutions[0].length > 1 && (
                <div className="detail-evolutions">
                  <h4>Evolution Chain</h4>
                  {detail.evolutions.map((path, pi) => (
                    <div key={pi} className="evolution-chain">
                      {path.map((evo, i) => (
                        <div key={evo.name} className="evolution-step">
                          {i > 0 && (
                            <div className="evolution-arrow">
                              {evo.method && <span className="evolution-method">{evo.method}</span>}
                              <span className="arrow">&rarr;</span>
                            </div>
                          )}
                          <div
                            className={`evolution-item clickable ${selected === evo.name ? "selected" : ""}`}
                            onClick={() => handleClick(evo.name)}
                          >
                            <img src={evo.spriteUrl} alt={evo.name} />
                            <span>{evo.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="pokemon-controls">
        <input
          className="pokemon-search"
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setSelected(null); setDetail(null); setPage(0); if (selectedTypes.length > 0) { searchClearedTypes.current = true; onClearTypes(); } }}
        />
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="id">Pokédex #</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      <div className="gen-filter">
        {GENERATIONS.map((gen, i) => (
          <button
            key={gen.label}
            className={selectedGen === i ? "active" : ""}
            onClick={() => { setSelectedGen(i); setPage(0); }}
          >
            {gen.label}
          </button>
        ))}
      </div>

      <div className="pokemon-grid">
        {loading ? (
          <p className="hint">Loading Pokémon...</p>
        ) : (
          <>
            {pagedPokemon.map((p) => (
              <div
                key={p.name}
                className={`pokemon-card ${selected === p.name ? "selected" : ""}`}
                onClick={() => handleClick(p.name)}
              >
                <span className="pokemon-id">#{String(p.id).padStart(3, "0")}</span>
                <img src={p.spriteUrl} alt={p.name} loading="lazy" />
                <span>{p.name}</span>
                <div className="card-type-pills">
                  {p.types.map((t) => (
                    <span key={t} className="card-type-pill" style={{ backgroundColor: TYPE_COLORS[t] }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {filteredPokemon.length === 0 && <p className="hint">No Pokémon match your filters</p>}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            &laquo; Prev
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default PokemonList;
