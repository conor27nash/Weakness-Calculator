package main

import (
	"context"

	"github.com/conor27nash/weakness-calculator/desktop/backend"
)

// App exposes Go functions to the frontend via Wails bindings.
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) CalculateWeaknesses(type1, type2 string) ([]backend.MatchupResult, error) {
	return backend.CalculateWeaknesses(a.ctx, type1, type2)
}

func (a *App) FetchAllPokemon() ([]backend.Pokemon, error) {
	return backend.FetchAllPokemon(a.ctx)
}

func (a *App) FetchPokemonByTypes(type1, type2 string) ([]backend.Pokemon, error) {
	return backend.FetchPokemonByTypes(a.ctx, type1, type2)
}

func (a *App) FetchPokemonDetail(name string) (*backend.PokemonDetail, error) {
	return backend.FetchPokemonDetail(a.ctx, name)
}

func (a *App) AnalyzeTeam(team []backend.TeamMember) (*backend.TeamAnalysis, error) {
	return backend.AnalyzeTeam(a.ctx, team)
}

func (a *App) SuggestTypes(team []backend.TeamMember) ([]backend.TypeSuggestion, error) {
	return backend.SuggestTypes(a.ctx, team)
}
