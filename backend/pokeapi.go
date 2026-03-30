package backend

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type Pokemon struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	SpriteURL string `json:"spriteUrl"`
}

type pokeAPITypeResponse struct {
	Pokemon []struct {
		Pokemon struct {
			Name string `json:"name"`
			URL  string `json:"url"`
		} `json:"pokemon"`
	} `json:"pokemon"`
}

func FetchPokemonByTypes(ctx context.Context, type1, type2 string) ([]Pokemon, error) {
	list1, err := fetchTypeList(ctx, type1)
	if err != nil {
		return nil, err
	}

	if type2 == "" {
		return list1, nil
	}

	list2, err := fetchTypeList(ctx, type2)
	if err != nil {
		return nil, err
	}

	// Intersect: only Pokémon that appear in both type lists
	set := make(map[string]Pokemon, len(list1))
	for _, p := range list1 {
		set[p.Name] = p
	}

	var result []Pokemon
	for _, p := range list2 {
		if _, ok := set[p.Name]; ok {
			result = append(result, p)
		}
	}
	return result, nil
}

func fetchTypeList(ctx context.Context, typeName string) ([]Pokemon, error) {
	var data pokeAPITypeResponse
	if err := fetchJSON(ctx, fmt.Sprintf("https://pokeapi.co/api/v2/type/%s", typeName), &data); err != nil {
		return nil, err
	}

	result := make([]Pokemon, 0, len(data.Pokemon))
	for _, entry := range data.Pokemon {
		idStr := extractID(entry.Pokemon.URL)
		idNum, _ := strconv.Atoi(idStr)
		result = append(result, Pokemon{
			ID:        idNum,
			Name:      entry.Pokemon.Name,
			SpriteURL: fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%s.png", idStr),
		})
	}
	return result, nil
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

func FetchPokemonDetail(ctx context.Context, name string) (*PokemonDetail, error) {
	// Fetch base pokemon data (stats, abilities, height, weight)
	var pokemonData struct {
		Name    string `json:"name"`
		Height  int    `json:"height"`
		Weight  int    `json:"weight"`
		ID      int    `json:"id"`
		Stats   []struct {
			BaseStat int `json:"base_stat"`
			Stat     struct {
				Name string `json:"name"`
			} `json:"stat"`
		} `json:"stats"`
		Abilities []struct {
			Ability struct {
				Name string `json:"name"`
			} `json:"ability"`
		} `json:"abilities"`
		Types []struct {
			Type struct {
				Name string `json:"name"`
			} `json:"type"`
		} `json:"types"`
	}
	if err := fetchJSON(ctx, fmt.Sprintf("https://pokeapi.co/api/v2/pokemon/%s", name), &pokemonData); err != nil {
		return nil, err
	}

	detail := &PokemonDetail{
		ID:        pokemonData.ID,
		Name:      pokemonData.Name,
		SpriteURL: fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%d.png", pokemonData.ID),
		Height:    pokemonData.Height,
		Weight:    pokemonData.Weight,
	}

	for _, t := range pokemonData.Types {
		detail.Types = append(detail.Types, t.Type.Name)
	}
	for _, s := range pokemonData.Stats {
		detail.Stats = append(detail.Stats, Stat{Name: s.Stat.Name, Value: s.BaseStat})
	}
	for _, a := range pokemonData.Abilities {
		desc, _ := fetchAbilityDescription(ctx, a.Ability.Name)
		detail.Abilities = append(detail.Abilities, Ability{Name: a.Ability.Name, Description: desc})
	}

	// Fetch species data to get evolution chain URL
	var speciesData struct {
		EvolutionChain struct {
			URL string `json:"url"`
		} `json:"evolution_chain"`
	}
	if err := fetchJSON(ctx, fmt.Sprintf("https://pokeapi.co/api/v2/pokemon-species/%s", name), &speciesData); err != nil {
		return nil, err
	}

	// Fetch evolution chain
	var chainData struct {
		Chain chainLink `json:"chain"`
	}
	if err := fetchJSON(ctx, speciesData.EvolutionChain.URL, &chainData); err != nil {
		return nil, err
	}

	detail.Evolutions = buildEvolutionPaths(chainData.Chain)
	return detail, nil
}

type chainLink struct {
	Species struct {
		Name string `json:"name"`
		URL  string `json:"url"`
	} `json:"species"`
	EvolvesTo        []chainLink          `json:"evolves_to"`
	EvolutionDetails []evolutionDetailJSON `json:"evolution_details"`
}

type evolutionDetailJSON struct {
	Trigger struct {
		Name string `json:"name"`
	} `json:"trigger"`
	MinLevel      *int                            `json:"min_level"`
	Item          *struct{ Name string `json:"name"` } `json:"item"`
	HeldItem      *struct{ Name string `json:"name"` } `json:"held_item"`
	MinHappiness  *int                            `json:"min_happiness"`
	TimeOfDay     string                          `json:"time_of_day"`
	KnownMove     *struct{ Name string `json:"name"` } `json:"known_move"`
	KnownMoveType *struct{ Name string `json:"name"` } `json:"known_move_type"`
	Location      *struct{ Name string `json:"name"` } `json:"location"`
}

func buildEvolutionPaths(link chainLink) [][]Evolution {
	id := extractID(link.Species.URL)
	current := Evolution{
		Name:      link.Species.Name,
		SpriteURL: fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%s.png", id),
	}
	if len(link.EvolutionDetails) > 0 {
		current.Method = formatEvolutionMethod(link.EvolutionDetails[0])
	}

	if len(link.EvolvesTo) == 0 {
		return [][]Evolution{{current}}
	}

	var paths [][]Evolution
	for _, next := range link.EvolvesTo {
		for _, subPath := range buildEvolutionPaths(next) {
			paths = append(paths, append([]Evolution{current}, subPath...))
		}
	}
	return paths
}

func formatEvolutionMethod(d evolutionDetailJSON) string {
	switch d.Trigger.Name {
	case "level-up":
		if d.MinLevel != nil {
			return fmt.Sprintf("Level %d", *d.MinLevel)
		}
		if d.MinHappiness != nil {
			s := "Happiness"
			if d.TimeOfDay != "" {
				s += " (" + d.TimeOfDay + ")"
			}
			return s
		}
		if d.KnownMove != nil {
			return "Know " + formatName(d.KnownMove.Name)
		}
		if d.KnownMoveType != nil {
			return "Know " + formatName(d.KnownMoveType.Name) + " move"
		}
		if d.Location != nil {
			return "At " + formatName(d.Location.Name)
		}
		return "Level up"
	case "use-item":
		if d.Item != nil {
			return formatName(d.Item.Name)
		}
		return "Use item"
	case "trade":
		if d.HeldItem != nil {
			return "Trade holding " + formatName(d.HeldItem.Name)
		}
		return "Trade"
	default:
		return formatName(d.Trigger.Name)
	}
}

func formatName(name string) string {
	return strings.ReplaceAll(name, "-", " ")
}

func fetchAbilityDescription(ctx context.Context, name string) (string, error) {
	var data struct {
		EffectEntries []struct {
			ShortEffect string `json:"short_effect"`
			Language    struct {
				Name string `json:"name"`
			} `json:"language"`
		} `json:"effect_entries"`
	}
	if err := fetchJSON(ctx, fmt.Sprintf("https://pokeapi.co/api/v2/ability/%s", name), &data); err != nil {
		return "", err
	}
	for _, entry := range data.EffectEntries {
		if entry.Language.Name == "en" {
			return entry.ShortEffect, nil
		}
	}
	return "", nil
}

func fetchJSON(ctx context.Context, url string, target any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("pokeapi returned status %d for %s", resp.StatusCode, url)
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

func extractID(url string) string {
	trimmed := strings.TrimRight(url, "/")
	parts := strings.Split(trimmed, "/")
	return parts[len(parts)-1]
}
