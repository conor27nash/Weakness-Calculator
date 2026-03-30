package main

import (
	"context"

	"github.com/conor27nash/weakness-calculator/backend"
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

func (a *App) CalculateAttacking(attackType string) ([]backend.MatchupResult, error) {
	return backend.CalculateAttacking(a.ctx, attackType)
}

func (a *App) FetchPokemonByTypes(type1, type2 string) ([]backend.Pokemon, error) {
	return backend.FetchPokemonByTypes(a.ctx, type1, type2)
}

func (a *App) FetchPokemonDetail(name string) (*backend.PokemonDetail, error) {
	return backend.FetchPokemonDetail(a.ctx, name)
}
