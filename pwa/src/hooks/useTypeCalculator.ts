import { useState, useEffect } from "react";
import type { MatchupResult, Pokemon } from "../types";
import { getWeaknesses, getPokemon } from "../lib/dataLayer";

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
                return [typeName];
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

        getWeaknesses(selectedTypes)
            .then((data) => setResults(data))
            .catch(() => setResults([]));
    }, [selectedTypes]);

    useEffect(() => {
        setPokemonLoading(true);
        getPokemon(selectedTypes)
            .then((data) => setPokemon(data ?? []))
            .catch(() => setPokemon([]))
            .finally(() => setPokemonLoading(false));
    }, [selectedTypes]);

    return { selectedTypes, setTypes, toggleType, clearSelection, results, pokemon, pokemonLoading };
}
