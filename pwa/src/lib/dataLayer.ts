import { calculateWeaknesses, analyzeTeam, suggestTypes } from "./typeEngine";
import * as PokeAPI from "./pokeapiClient";
import type { MatchupResult, Pokemon, PokemonDetail, TeamAnalysis, TypeSuggestion } from "../types";

function isWails(): boolean {
  return (window as any).go !== undefined;
}

// ---------------------------------------------------------------------------
// Type calculation — always local (no network needed)
// ---------------------------------------------------------------------------

export async function getWeaknesses(types: string[]): Promise<MatchupResult[]> {
  return calculateWeaknesses(types[0], types[1]);
}

// ---------------------------------------------------------------------------
// Team analysis — always local (no network needed)
// ---------------------------------------------------------------------------

export async function getTeamAnalysis(team: { name: string; types: string[] }[]): Promise<TeamAnalysis> {
  return analyzeTeam(team);
}

export async function getTypeSuggestions(team: { name: string; types: string[] }[]): Promise<TypeSuggestion[]> {
  return suggestTypes(team);
}

// ---------------------------------------------------------------------------
// Pokemon list — PokeAPI with Wails/CSV fallback when offline
// ---------------------------------------------------------------------------

export async function getPokemon(selectedTypes: string[]): Promise<Pokemon[]> {
  try {
    if (selectedTypes.length === 0) {
      return await PokeAPI.fetchAllPokemon();
    }
    return await PokeAPI.fetchPokemonByTypes(selectedTypes[0], selectedTypes[1]);
  } catch {
    // Fallback to Wails Go bindings if PokeAPI fails (offline desktop)
    if (isWails()) {
      const wailsApp = (window as any).go.main.App;
      if (selectedTypes.length === 0) return wailsApp.FetchAllPokemon();
      return wailsApp.FetchPokemonByTypes(selectedTypes[0], selectedTypes[1] || "");
    }
    return [];
  }
}

// ---------------------------------------------------------------------------
// Pokemon detail — PokeAPI with Wails/CSV fallback when offline
// ---------------------------------------------------------------------------

export async function getPokemonDetail(name: string): Promise<PokemonDetail> {
  try {
    return await PokeAPI.fetchPokemonDetail(name);
  } catch {
    // Fallback to Wails Go bindings if PokeAPI fails (offline desktop)
    if (isWails()) {
      return (window as any).go.main.App.FetchPokemonDetail(name);
    }
    throw new Error("Failed to fetch Pokemon detail");
  }
}
