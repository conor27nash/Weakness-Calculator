import { useState, useEffect } from "react";
import type { MatchupResult, Pokemon } from "../types";

// Wails injects window.go when running as a desktop app
function isWails(): boolean {
    return (window as any).go !== undefined;
}

async function fetchViaWails(selectedTypes: string[]): Promise<MatchupResult[]> {
    const wailsApp = (window as any).go.main.App;
    return wailsApp.CalculateWeaknesses(selectedTypes[0], selectedTypes[1] || "");
}

async function fetchViaHttp(selectedTypes: string[]): Promise<MatchupResult[]> {
    let url = `/defend?type1=${selectedTypes[0]}`;
    if (selectedTypes[1]) {
        url += `&type2=${selectedTypes[1]}`;
    }
    const res = await fetch(url);
    return res.json();
}

async function fetchPokemonViaWails(selectedTypes: string[]): Promise<Pokemon[]> {
    const wailsApp = (window as any).go.main.App;
    if (selectedTypes.length === 0) {
        return wailsApp.FetchAllPokemon();
    }
    return wailsApp.FetchPokemonByTypes(selectedTypes[0], selectedTypes[1] || "");
}

async function fetchPokemonViaHttp(selectedTypes: string[]): Promise<Pokemon[]> {
    let url = "/pokemon";
    if (selectedTypes.length > 0) {
        url += `?type1=${selectedTypes[0]}`;
        if (selectedTypes[1]) {
            url += `&type2=${selectedTypes[1]}`;
        }
    }
    const res = await fetch(url);
    return res.json();
}

export function useTypeCalculator() {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [results, setResults] = useState<MatchupResult[]>([]);
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [pokemonLoading, setPokemonLoading] = useState(false);

    function toggleType(typeName: string) {
        setSelectedTypes((prev) => {
            if (prev.includes(typeName)) {
                return prev.filter((t) => t !== typeName);
            }
            if (prev.length >= 2) {
                return prev;
            }
            return [...prev, typeName];
        });
    }

    function setTypes(types: string[]) {
        setSelectedTypes(types);
    }

    function clearSelection() {
        setSelectedTypes([]);
        setResults([]);
    }

    useEffect(() => {
        if (selectedTypes.length === 0) {
            setResults([]);
            return;
        }

        const fetchResults = isWails() ? fetchViaWails : fetchViaHttp;

        fetchResults(selectedTypes)
            .then((data) => setResults(data))
            .catch(() => setResults([]));
    }, [selectedTypes]);

    useEffect(() => {
        setPokemonLoading(true);
        const fetchPokemon = isWails() ? fetchPokemonViaWails : fetchPokemonViaHttp;

        fetchPokemon(selectedTypes)
            .then((data) => setPokemon(data ?? []))
            .catch(() => setPokemon([]))
            .finally(() => setPokemonLoading(false));
    }, [selectedTypes]);

    return { selectedTypes, setTypes, toggleType, clearSelection, results, pokemon, pokemonLoading };
}
