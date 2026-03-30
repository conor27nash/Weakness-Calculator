export interface MatchupResult {
  attackType: string;
  multiplier: number;
}

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
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

export type Mode = "defend" | "attack";
