package backend

import (
	"encoding/json"
	"net/http"
	"slices"
	"strings"
)

// HandleDefend handles GET /defend?type1=X&type2=Y
func HandleDefend(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	type1, ok := validateType(r.URL.Query().Get("type1"))
	if !ok {
		http.Error(w, "invalid or missing type1", http.StatusBadRequest)
		return
	}

	type2 := ""
	if raw := r.URL.Query().Get("type2"); raw != "" {
		t2, ok := validateType(raw)
		if !ok {
			http.Error(w, "invalid type2", http.StatusBadRequest)
			return
		}
		type2 = t2
	}

	results, err := CalculateWeaknesses(ctx, type1, type2)
	if err != nil {
		http.Error(w, "request cancelled", http.StatusRequestTimeout)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

// HandlePokemon handles GET /pokemon?type1=X&type2=Y
// If no type1 is provided, returns all Pokémon.
func HandlePokemon(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	raw1 := r.URL.Query().Get("type1")

	var pokemon []Pokemon
	var err error

	if raw1 == "" {
		pokemon, err = FetchAllPokemon(ctx)
	} else {
		type1, ok := validateType(raw1)
		if !ok {
			http.Error(w, "invalid type1", http.StatusBadRequest)
			return
		}

		type2 := ""
		if raw := r.URL.Query().Get("type2"); raw != "" {
			t2, ok := validateType(raw)
			if !ok {
				http.Error(w, "invalid type2", http.StatusBadRequest)
				return
			}
			type2 = t2
		}

		pokemon, err = FetchPokemonByTypes(ctx, type1, type2)
	}

	if err != nil {
		http.Error(w, "failed to fetch pokemon", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(pokemon); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

// HandlePokemonDetail handles GET /pokemon-detail?name=X
func HandlePokemonDetail(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	name := strings.ToLower(r.URL.Query().Get("name"))
	if name == "" {
		http.Error(w, "missing name parameter", http.StatusBadRequest)
		return
	}

	detail, err := FetchPokemonDetail(ctx, name)
	if err != nil {
		http.Error(w, "failed to fetch pokemon detail", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(detail); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}

// HandleTeamAnalyze handles POST /team/analyze
func HandleTeamAnalyze(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var body struct {
		Team []TeamMember `json:"team"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if len(body.Team) == 0 {
		http.Error(w, "team is empty", http.StatusBadRequest)
		return
	}

	analysis, err := AnalyzeTeam(ctx, body.Team)
	if err != nil {
		http.Error(w, "request cancelled", http.StatusRequestTimeout)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}

// HandleTeamSuggest handles POST /team/suggest
func HandleTeamSuggest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var body struct {
		Team []TeamMember `json:"team"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if len(body.Team) == 0 {
		http.Error(w, "team is empty", http.StatusBadRequest)
		return
	}

	suggestions, err := SuggestTypes(ctx, body.Team)
	if err != nil {
		http.Error(w, "request cancelled", http.StatusRequestTimeout)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(suggestions)
}

func validateType(t string) (string, bool) {
	t = strings.ToLower(t)
	if slices.Contains(AllTypes, t) {
		return t, true
	}
	return "", false
}
