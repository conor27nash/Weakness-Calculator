package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"

	"github.com/conor27nash/weakness-calculator/fullstack/backend"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	if err := backend.InitPokeDB(); err != nil {
		fmt.Printf("Failed to load Pokémon database: %v\n", err)
		return
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/defend", backend.HandleDefend)
	mux.HandleFunc("/pokemon", backend.HandlePokemon)
	mux.HandleFunc("/pokemon-detail", backend.HandlePokemonDetail)
	mux.HandleFunc("/team/analyze", backend.HandleTeamAnalyze)
	mux.HandleFunc("/team/suggest", backend.HandleTeamSuggest)

	frontendFiles, err := fs.Sub(assets, "frontend/dist")
	if err != nil {
		fmt.Printf("Failed to load frontend assets: %v\n", err)
		return
	}
	mux.Handle("/", http.FileServer(http.FS(frontendFiles)))

	fmt.Println("Server running at http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
