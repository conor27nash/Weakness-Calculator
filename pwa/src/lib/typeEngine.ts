import { ALL_TYPES } from "../constants";
import type { MatchupResult, TeamAnalysis, TypeCoverage, TypeSuggestion } from "../types";

// Sparse map: only non-1.0 entries stored. Mirrors backend/typechart.go exactly.
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, poison: 0.5, fighting: 2, dragon: 2, dark: 2, steel: 0.5 },
};

function effectiveness(attackType: string, defenderType: string): number {
  return TYPE_CHART[attackType]?.[defenderType] ?? 1.0;
}

export function calculateWeaknesses(type1: string, type2?: string): MatchupResult[] {
  return ALL_TYPES.map((atk) => {
    let mult = effectiveness(atk, type1);
    if (type2) mult *= effectiveness(atk, type2);
    return { attackType: atk, multiplier: mult };
  });
}

export function analyzeTeam(team: { name: string; types: string[] }[]): TeamAnalysis {
  const coverages: TypeCoverage[] = ALL_TYPES.map((atk) => {
    let weakCount = 0, resistCount = 0, immuneCount = 0;
    for (const member of team) {
      let mult = effectiveness(atk, member.types[0]);
      if (member.types[1]) mult *= effectiveness(atk, member.types[1]);
      if (mult === 0) immuneCount++;
      else if (mult > 1) weakCount++;
      else if (mult < 1) resistCount++;
    }
    return { attackType: atk, weakCount, resistCount, immuneCount };
  });

  const uncovered = coverages
    .filter((c) => c.weakCount > 0 && c.resistCount === 0 && c.immuneCount === 0)
    .map((c) => c.attackType);

  return { coverages, uncovered };
}

export function suggestTypes(team: { name: string; types: string[] }[]): TypeSuggestion[] {
  const { uncovered } = analyzeTeam(team);
  if (uncovered.length === 0) return [];

  const candidates: TypeSuggestion[] = [];

  // Single types
  for (const t1 of ALL_TYPES) {
    const score = uncovered.filter((atk) => effectiveness(atk, t1) < 1).length;
    if (score > 0) candidates.push({ types: [t1], score });
  }

  // Dual types
  for (let i = 0; i < ALL_TYPES.length; i++) {
    for (let j = i + 1; j < ALL_TYPES.length; j++) {
      const score = uncovered.filter((atk) =>
        effectiveness(atk, ALL_TYPES[i]) * effectiveness(atk, ALL_TYPES[j]) < 1
      ).length;
      if (score > 0) candidates.push({ types: [ALL_TYPES[i], ALL_TYPES[j]], score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, 10);
}
