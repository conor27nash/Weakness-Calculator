// Matches the Go backend's MatchupResult struct
export interface MatchupResult {
  attackType: string;
  multiplier: number;
}

// The mode the calculator is in
export type Mode = "defend" | "attack";
