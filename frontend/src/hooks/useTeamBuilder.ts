import { useState, useEffect, useCallback } from "react";
import type { TeamMember, TeamAnalysis, TypeSuggestion } from "../types";

function isWails(): boolean {
  return (window as any).go !== undefined;
}

async function fetchAnalysis(team: TeamMember[]): Promise<TeamAnalysis> {
  if (isWails()) {
    return (window as any).go.main.App.AnalyzeTeam(team);
  }
  const res = await fetch("/team/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team }),
  });
  return res.json();
}

async function fetchSuggestions(team: TeamMember[]): Promise<TypeSuggestion[]> {
  if (isWails()) {
    return (window as any).go.main.App.SuggestTypes(team);
  }
  const res = await fetch("/team/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team }),
  });
  return res.json();
}

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

    fetchAnalysis(members)
      .then(setAnalysis)
      .catch(() => setAnalysis(null));

    if (team.length < 6) {
      fetchSuggestions(members)
        .then((data) => setSuggestions(data ?? []))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [team]);

  return { team, analysis, suggestions, addToTeam, removeFromTeam, clearTeam };
}
