export interface MatchupResult {
  attackType: string;
  multiplier: number;
}

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
  types: string[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  spriteUrl: string;
  types: string[];
  height: number;
  weight: number;
  stats: { name: string; value: number }[];
  abilities: { name: string; description: string }[];
  evolutions: { name: string; spriteUrl: string; method: string }[][];
}

export interface TeamMember {
  name: string;
  types: string[];
}

export interface TypeCoverage {
  attackType: string;
  weakCount: number;
  resistCount: number;
  immuneCount: number;
}

export interface TeamAnalysis {
  coverages: TypeCoverage[];
  uncovered: string[];
}

export interface TypeSuggestion {
  types: string[];
  score: number;
}

