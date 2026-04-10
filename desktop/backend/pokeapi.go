package backend

import (
	"context"
)

type Pokemon struct {
	ID        int      `json:"id"`
	Name      string   `json:"name"`
	SpriteURL string   `json:"spriteUrl"`
	Types     []string `json:"types"`
}

type PokemonDetail struct {
	ID         int           `json:"id"`
	Name       string        `json:"name"`
	SpriteURL  string        `json:"spriteUrl"`
	Types      []string      `json:"types"`
	Height     int           `json:"height"`
	Weight     int           `json:"weight"`
	Stats      []Stat        `json:"stats"`
	Abilities  []Ability     `json:"abilities"`
	Evolutions [][]Evolution `json:"evolutions"`
}

type Stat struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type Ability struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Evolution struct {
	Name      string `json:"name"`
	SpriteURL string `json:"spriteUrl"`
	Method    string `json:"method"`
}

func FetchAllPokemon(ctx context.Context) ([]Pokemon, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}
	return DB.QueryAllPokemon(), nil
}

func FetchPokemonByTypes(ctx context.Context, type1, type2 string) ([]Pokemon, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}
	return DB.QueryPokemonByTypes(type1, type2)
}

func FetchPokemonDetail(ctx context.Context, name string) (*PokemonDetail, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}
	return DB.QueryPokemonDetail(name)
}
