package backend_test

import (
	"context"
	"testing"

	"github.com/conor27nash/weakness-calculator/desktop/backend"
)

func TestEffectiveness(t *testing.T) {
	tests := []struct {
		name         string
		attackType   string
		defenderType string
		want         float64
	}{
		// Super effective (2.0)
		{name: "fire vs grass is super effective", attackType: "fire", defenderType: "grass", want: 2.0},
		{name: "water vs fire is super effective", attackType: "water", defenderType: "fire", want: 2.0},
		{name: "fighting vs normal is super effective", attackType: "fighting", defenderType: "normal", want: 2.0},
		{name: "ice vs dragon is super effective", attackType: "ice", defenderType: "dragon", want: 2.0},
		{name: "fairy vs dragon is super effective", attackType: "fairy", defenderType: "dragon", want: 2.0},

		// Not very effective (0.5)
		{name: "fire vs water is not very effective", attackType: "fire", defenderType: "water", want: 0.5},
		{name: "grass vs fire is not very effective", attackType: "grass", defenderType: "fire", want: 0.5},
		{name: "dark vs fairy is not very effective", attackType: "dark", defenderType: "fairy", want: 0.5},
		{name: "steel vs steel resists itself", attackType: "steel", defenderType: "steel", want: 0.5},

		// Immunity (0.0)
		{name: "normal vs ghost is immune", attackType: "normal", defenderType: "ghost", want: 0.0},
		{name: "electric vs ground is immune", attackType: "electric", defenderType: "ground", want: 0.0},
		{name: "ground vs flying is immune", attackType: "ground", defenderType: "flying", want: 0.0},
		{name: "ghost vs normal is immune", attackType: "ghost", defenderType: "normal", want: 0.0},
		{name: "psychic vs dark is immune", attackType: "psychic", defenderType: "dark", want: 0.0},
		{name: "dragon vs fairy is immune", attackType: "dragon", defenderType: "fairy", want: 0.0},
		{name: "fighting vs ghost is immune", attackType: "fighting", defenderType: "ghost", want: 0.0},
		{name: "poison vs steel is immune", attackType: "poison", defenderType: "steel", want: 0.0},

		// Neutral (1.0) - not in the map, should default
		{name: "fire vs fighting is neutral", attackType: "fire", defenderType: "fighting", want: 1.0},
		{name: "water vs normal is neutral", attackType: "water", defenderType: "normal", want: 1.0},
		{name: "ghost vs grass is neutral", attackType: "ghost", defenderType: "grass", want: 1.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := backend.Effectiveness(tt.attackType, tt.defenderType)
			if got != tt.want {
				t.Errorf("Effectiveness(%s, %s) = %v, want %v", tt.attackType, tt.defenderType, got, tt.want)
			}
		})
	}
}

func TestAllTypes_HasExactly18(t *testing.T) {
	if len(backend.AllTypes) != 18 {
		t.Errorf("AllTypes has %d entries, want 18", len(backend.AllTypes))
	}
}

func TestTypeChart_AllTypesHaveEntries(t *testing.T) {
	for _, typeName := range backend.AllTypes {
		if _, ok := backend.TypeChart[typeName]; !ok {
			t.Errorf("TypeChart missing attacking type: %s", typeName)
		}
	}
}

func TestCalculateWeaknesses(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name      string
		type1     string
		type2     string
		checkType string
		wantMult  float64
	}{
		// Single type weaknesses
		{name: "fire weak to water", type1: "fire", type2: "", checkType: "water", wantMult: 2.0},
		{name: "fire resists grass", type1: "fire", type2: "", checkType: "grass", wantMult: 0.5},
		{name: "ghost immune to normal", type1: "ghost", type2: "", checkType: "normal", wantMult: 0.0},

		// Dual type: quad weakness (2.0 * 2.0 = 4.0)
		{name: "fire/ground is 4x weak to water", type1: "fire", type2: "ground", checkType: "water", wantMult: 4.0},
		{name: "grass/ice is 4x weak to fire", type1: "grass", type2: "ice", checkType: "fire", wantMult: 4.0},

		// Dual type: double resistance (0.5 * 0.5 = 0.25)
		{name: "fire/water double resists fire", type1: "fire", type2: "water", checkType: "fire", wantMult: 0.25},
		{name: "steel/rock double resists normal", type1: "steel", type2: "rock", checkType: "normal", wantMult: 0.25},

		// Dual type: weakness cancelled by resistance (2.0 * 0.5 = 1.0)
		{name: "fire/grass neutral to water", type1: "fire", type2: "grass", checkType: "water", wantMult: 1.0},

		// Dual type: immunity overrides everything (anything * 0.0 = 0.0)
		{name: "normal/flying is immune to ground", type1: "normal", type2: "flying", checkType: "ground", wantMult: 0.0},
		{name: "ghost/dark is immune to fighting", type1: "ghost", type2: "dark", checkType: "fighting", wantMult: 0.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			results, err := backend.CalculateWeaknesses(ctx, tt.type1, tt.type2)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			for _, r := range results {
				if r.AttackType == tt.checkType {
					if r.Multiplier != tt.wantMult {
						t.Errorf("CalculateWeaknesses(%s, %s)[%s] = %v, want %v",
							tt.type1, tt.type2, tt.checkType, r.Multiplier, tt.wantMult)
					}
					return
				}
			}
			t.Errorf("attacking type %s not found in results", tt.checkType)
		})
	}
}

func TestCalculateWeaknesses_Returns18Results(t *testing.T) {
	ctx := context.Background()

	results, err := backend.CalculateWeaknesses(ctx, "fire", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(results) != 18 {
		t.Errorf("CalculateWeaknesses returned %d results, want 18", len(results))
	}

	dualResults, err := backend.CalculateWeaknesses(ctx, "fire", "water")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(dualResults) != 18 {
		t.Errorf("CalculateWeaknesses (dual) returned %d results, want 18", len(dualResults))
	}
}

func TestCalculateWeaknesses_CancelledContext(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // cancel immediately

	_, err := backend.CalculateWeaknesses(ctx, "fire", "")
	if err == nil {
		t.Error("expected error from cancelled context, got nil")
	}
}

