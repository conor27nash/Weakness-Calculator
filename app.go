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
