package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"net/http"

	"github.com/conor27nash/weakness-calculator/desktop/backend"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	if err := backend.InitPokeDB(); err != nil {
		fmt.Printf("Failed to load Pokémon database: %v\n", err)
		return
	}

	webMode := flag.Bool("web", false, "Run as HTTP web server instead of desktop app")
	flag.Parse()

	if *webMode {
		runWebServer()
	} else {
		runDesktop()
	}
}

// runWebServer starts the HTTP API server (used by Docker / web deployment).
func runWebServer() {
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

func runDesktop() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "aron.net",
		Width:  800,
		Height: 600,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		fmt.Printf("Desktop app error: %v\n", err)
	}
}
