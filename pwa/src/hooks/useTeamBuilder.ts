import { useState, useEffect, useCallback } from "react";
import type { TeamMember, TeamAnalysis, TypeSuggestion } from "../types";
import { getTeamAnalysis, getTypeSuggestions } from "../lib/dataLayer";

export interface TeamSlot {
  name: string;
  types: string[];
  spriteUrl: string;
}

export function useTeamBuilder() {
  const [team, setTeam] = useState<TeamSlot[]>([]);
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<TypeSuggestion[]>([]);

  const addToTeam = useCallback((slot: TeamSlot) => {
    setTeam((prev) => {
      if (prev.length >= 6) return prev;
      if (prev.some((s) => s.name === slot.name)) return prev;
      return [...prev, slot];
    });
  }, []);

  const removeFromTeam = useCallback((index: number) => {
    setTeam((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearTeam = useCallback(() => {
    setTeam([]);
    setAnalysis(null);
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (team.length === 0) {
      setAnalysis(null);
      setSuggestions([]);
      return;
    }

    const members: TeamMember[] = team.map((s) => ({ name: s.name, types: s.types }));

    getTeamAnalysis(members)
      .then(setAnalysis)
      .catch(() => setAnalysis(null));

    if (team.length < 6) {
      getTypeSuggestions(members)
        .then((data) => setSuggestions(data ?? []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [team]);

  return { team, analysis, suggestions, addToTeam, removeFromTeam, clearTeam };
}
