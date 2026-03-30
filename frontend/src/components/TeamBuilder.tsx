import { useState } from "react";
import type { TeamAnalysis, TypeSuggestion } from "../types";
import type { TeamSlot } from "../hooks/useTeamBuilder";
import { TYPE_COLORS, ALL_TYPES } from "../constants";

interface TeamBuilderProps {
  team: TeamSlot[];
  analysis: TeamAnalysis | null;
  suggestions: TypeSuggestion[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

function TeamBuilder({ team, analysis, suggestions, onRemove, onClear }: TeamBuilderProps) {
  const [showCoverage, setShowCoverage] = useState(false);

  return (
    <div className="team-builder">
      <div className="team-header">
        <h2>Team Builder ({team.length}/6)</h2>
        <div className="team-header-actions">
          {analysis && (
            <button
              className={`coverage-toggle ${showCoverage ? "active" : ""}`}
              onClick={() => setShowCoverage((v) => !v)}
            >
              Coverage
            </button>
          )}
          {team.length > 0 && (
            <button className="clear-btn" onClick={() => { setShowCoverage(false); onClear(); }}>Clear</button>
          )}
        </div>
      </div>

      <div className="team-slots-wrapper">
        <div className="team-slots">
          {Array.from({ length: 6 }).map((_, i) => {
            const slot = team[i];
            return (
              <div key={i} className={`team-slot ${slot ? "filled" : "empty"}`}>
                {slot ? (
                  <>
                    <img src={slot.spriteUrl} alt={slot.name} />
                    <span className="team-slot-name">{slot.name}</span>
                    <div className="team-slot-types">
                      {slot.types.map((t) => (
                        <span key={t} className="card-type-pill" style={{ backgroundColor: TYPE_COLORS[t] }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <button className="team-slot-remove" onClick={() => onRemove(i)}>&times;</button>
                  </>
                ) : (
                  <span className="team-slot-empty">Empty</span>
                )}
              </div>
            );
          })}
        </div>

        {showCoverage && (
          <div className="coverage-overlay">
            <div className="coverage-overlay-header">
              <h3>Type Coverage</h3>
              <button className="coverage-close" onClick={() => setShowCoverage(false)}>&times;</button>
            </div>

            {analysis && (
              <div className="coverage-chart">
                {ALL_TYPES.map((typeName) => {
                  const cov = analysis.coverages.find((c) => c.attackType === typeName);
                  if (!cov) return null;
                  const isUncovered = analysis.uncovered?.includes(typeName);
                  return (
                    <div key={typeName} className={`coverage-row ${isUncovered ? "uncovered" : ""}`}>
                      <span
                        className="coverage-type"
                        style={{ backgroundColor: TYPE_COLORS[typeName] }}
                      >
                        {typeName}
                      </span>
                      <div className="coverage-counts">
                        {cov.weakCount > 0 && (
                          <span className="coverage-weak">
                            {cov.weakCount} weak
                          </span>
                        )}
                        {cov.resistCount > 0 && (
                          <span className="coverage-resist">
                            {cov.resistCount} resist
                          </span>
                        )}
                        {cov.immuneCount > 0 && (
                          <span className="coverage-immune">
                            {cov.immuneCount} immune
                          </span>
                        )}
                        {cov.weakCount === 0 && cov.resistCount === 0 && cov.immuneCount === 0 && (
                          <span className="coverage-neutral">neutral</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3>Suggested Types</h3>
                <div className="suggestions-list">
                  {suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item">
                      <div className="suggestion-types">
                        {s.types.map((t) => (
                          <span key={t} className="card-type-pill" style={{ backgroundColor: TYPE_COLORS[t] }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="suggestion-score">
                        covers {s.score} weakness{s.score !== 1 ? "es" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamBuilder;
