import type { MatchupResult } from "../types";
import { MULTIPLIER_GROUPS, TYPE_COLORS } from "../constants";

interface ResultsListProps {
  results: MatchupResult[];
}

function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="results">
      {MULTIPLIER_GROUPS.map((group) => {
        const matching = results.filter(
          (r) => String(r.multiplier) === group.key
        );

        if (matching.length === 0) return null;

        return (
          <div key={group.key} className={`result-group ${group.className}`}>
            <h3>{group.label}</h3>
            <div className="result-badges">
              {matching.map((r) => (
                <span
                  key={r.attackType}
                  className="result-badge"
                  style={{ backgroundColor: TYPE_COLORS[r.attackType] }}
                >
                  {r.attackType.charAt(0).toUpperCase() + r.attackType.slice(1)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResultsList;
