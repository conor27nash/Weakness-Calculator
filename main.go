package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"net/http"

	"github.com/conor27nash/weakness-calculator/backend"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
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
	mux.HandleFunc("/attack", backend.HandleAttack)

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
		Title:  "Pokémon Type Calculator",
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
