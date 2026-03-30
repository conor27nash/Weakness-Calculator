import { useState, useEffect } from "react";
import type { Mode, MatchupResult, Pokemon } from "../types";

// Wails injects window.go when running as a desktop app
function isWails(): boolean {
    return (window as any).go !== undefined;
}

async function fetchViaWails(mode: Mode, selectedTypes: string[]): Promise<MatchupResult[]> {
    const wailsApp = (window as any).go.main.App;
    if (mode === "defend") {
        return wailsApp.CalculateWeaknesses(selectedTypes[0], selectedTypes[1] || "");
    } else {
        return wailsApp.CalculateAttacking(selectedTypes[0]);
    }
}

async function fetchViaHttp(mode: Mode, selectedTypes: string[]): Promise<MatchupResult[]> {
    let url: string;
    if (mode === "defend") {
        url = `/defend?type1=${selectedTypes[0]}`;
        if (selectedTypes[1]) {
            url += `&type2=${selectedTypes[1]}`;
        }
    } else {
        url = `/attack?type=${selectedTypes[0]}`;
    }
    const res = await fetch(url);
    return res.json();
}

async function fetchPokemonViaWails(selectedTypes: string[]): Promise<Pokemon[]> {
    const wailsApp = (window as any).go.main.App;
    return wailsApp.FetchPokemonByTypes(selectedTypes[0], selectedTypes[1] || "");
}

async function fetchPokemonViaHttp(selectedTypes: string[]): Promise<Pokemon[]> {
    let url = `/pokemon?type1=${selectedTypes[0]}`;
    if (selectedTypes[1]) {
        url += `&type2=${selectedTypes[1]}`;
    }
    const res = await fetch(url);
    return res.json();
}

export function useTypeCalculator() {
    const [mode, setModeState] = useState<Mode>("defend");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [results, setResults] = useState<MatchupResult[]>([]);
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [pokemonLoading, setPokemonLoading] = useState(false);

    function setMode(newMode: Mode) {
        setModeState(newMode)
        setSelectedTypes([])
        setResults([])
        setPokemon([])
    }

    function toggleType(typeName: string) {
        setSelectedTypes((prev) => {
            if (prev.includes(typeName)) {
                return prev.filter((t) => t !== typeName);
            }
            const maxTypes = mode === "defend" ? 2 : 1;
            if (prev.length >= maxTypes) {
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
        setPokemon([]);
    }

    useEffect(() => {
        if (selectedTypes.length === 0) {
            setResults([]);
            return;
        }

        const fetchResults = isWails() ? fetchViaWails : fetchViaHttp;

        fetchResults(mode, selectedTypes)
            .then((data) => setResults(data))
            .catch(() => setResults([]));
    }, [selectedTypes, mode]);

    useEffect(() => {
        if (mode !== "defend" || selectedTypes.length === 0) {
            setPokemon([]);
            return;
        }

        setPokemonLoading(true);
        const fetchPokemon = isWails() ? fetchPokemonViaWails : fetchPokemonViaHttp;

        fetchPokemon(selectedTypes)
            .then((data) => setPokemon(data ?? []))
            .catch(() => setPokemon([]))
            .finally(() => setPokemonLoading(false));
    }, [selectedTypes, mode]);

    return { mode, setMode, selectedTypes, setTypes, toggleType, clearSelection, results, pokemon, pokemonLoading };
}
