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

// HandleAttack handles GET /attack?type=X
func HandleAttack(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	attType, ok := validateType(r.URL.Query().Get("type"))
	if !ok {
		http.Error(w, "invalid or missing type", http.StatusBadRequest)
		return
	}

	results, err := CalculateAttacking(ctx, attType)
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

func validateType(t string) (string, bool) {
	t = strings.ToLower(t)
	if slices.Contains(AllTypes, t) {
		return t, true
	}
	return "", false
}
