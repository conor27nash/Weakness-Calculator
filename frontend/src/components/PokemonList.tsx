import { useState } from "react";
import type { Pokemon, PokemonDetail } from "../types";

interface PokemonListProps {
  pokemon: Pokemon[];
  loading: boolean;
  onTypesChange: (types: string[]) => void;
}

// Wails injects window.go when running as a desktop app
function isWails(): boolean {
  return (window as any).go !== undefined;
}

async function fetchDetail(name: string): Promise<PokemonDetail> {
  if (isWails()) {
    return (window as any).go.main.App.FetchPokemonDetail(name);
  }
  const res = await fetch(`/pokemon-detail?name=${name}`);
  return res.json();
}

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

function PokemonList({ pokemon, loading, onTypesChange }: PokemonListProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  function handleClick(name: string) {
    if (selected === name) {
      setSelected(null);
      setDetail(null);
      return;
    }

    setSelected(name);
    setDetail(null);
    setDetailLoading(true);

    fetchDetail(name)
      .then((data) => {
        setDetail(data);
        onTypesChange(data.types);
      })
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }

  if (loading) {
    return <p className="hint">Loading Pokémon...</p>;
  }

  if (pokemon.length === 0) {
    return null;
  }

  return (
    <div className="pokemon-section">
      <h2>Pokémon with this typing ({pokemon.length})</h2>

      {selected && (
        <div className="pokemon-detail">
          {detailLoading ? (
            <p className="hint">Loading details...</p>
          ) : detail ? (
            <>
              <div className="detail-header">
                <img src={detail.spriteUrl} alt={detail.name} />
                <div>
                  <h3>#{String(detail.id).padStart(3, "0")} {detail.name}</h3>
                  <p>Height: {detail.height / 10}m &middot; Weight: {detail.weight / 10}kg</p>
                </div>
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
                        style={{ width: `${Math.min((s.value / 255) * 100, 100)}%` }}
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

      <div className="pokemon-grid">
        {pokemon.map((p) => (
          <div
            key={p.name}
            className={`pokemon-card ${selected === p.name ? "selected" : ""}`}
            onClick={() => handleClick(p.name)}
          >
            <span className="pokemon-id">#{String(p.id).padStart(3, "0")}</span>
            <img src={p.spriteUrl} alt={p.name} loading="lazy" />
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PokemonList;
