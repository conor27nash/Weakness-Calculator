package backend

import "context"

var AllTypes = []string{
	"normal", "fire", "water", "electric", "grass", "ice",
	"fighting", "poison", "ground", "flying", "psychic", "bug",
	"rock", "ghost", "dragon", "dark", "steel", "fairy",
}

// Only non-1.0 entries are stored; missing entries default to 1.0 (neutral).
var TypeChart = map[string]map[string]float64{
	"normal": {
		"rock": 0.5, "ghost": 0.0, "steel": 0.5,
	},
	"fire": {
		"fire": 0.5, "water": 0.5, "grass": 2.0, "ice": 2.0,
		"bug": 2.0, "rock": 0.5, "dragon": 0.5, "steel": 2.0,
	},
	"water": {
		"fire": 2.0, "water": 0.5, "grass": 0.5,
		"ground": 2.0, "rock": 2.0, "dragon": 0.5,
	},
	"electric": {
		"water": 2.0, "electric": 0.5, "grass": 0.5,
		"ground": 0.0, "flying": 2.0, "dragon": 0.5,
	},
	"grass": {
		"fire": 0.5, "water": 2.0, "grass": 0.5, "poison": 0.5,
		"ground": 2.0, "flying": 0.5, "bug": 0.5,
		"rock": 2.0, "dragon": 0.5, "steel": 0.5,
	},
	"ice": {
		"fire": 0.5, "water": 0.5, "grass": 2.0, "ice": 0.5,
		"ground": 2.0, "flying": 2.0, "dragon": 2.0, "steel": 0.5,
	},
	"fighting": {
		"normal": 2.0, "ice": 2.0, "poison": 0.5, "flying": 0.5,
		"psychic": 0.5, "bug": 0.5, "rock": 2.0, "ghost": 0.0,
		"dark": 2.0, "steel": 2.0, "fairy": 0.5,
	},
	"poison": {
		"grass": 2.0, "poison": 0.5, "ground": 0.5,
		"rock": 0.5, "ghost": 0.5, "steel": 0.0, "fairy": 2.0,
	},
	"ground": {
		"fire": 2.0, "electric": 2.0, "grass": 0.5, "poison": 2.0,
		"flying": 0.0, "bug": 0.5, "rock": 2.0, "steel": 2.0,
	},
	"flying": {
		"electric": 0.5, "grass": 2.0, "fighting": 2.0,
		"bug": 2.0, "rock": 0.5, "steel": 0.5,
	},
	"psychic": {
		"fighting": 2.0, "poison": 2.0, "psychic": 0.5,
		"dark": 0.0, "steel": 0.5,
	},
	"bug": {
		"fire": 0.5, "grass": 2.0, "fighting": 0.5, "poison": 0.5,
		"flying": 0.5, "psychic": 2.0, "ghost": 0.5,
		"dark": 2.0, "steel": 0.5, "fairy": 0.5,
	},
	"rock": {
		"fire": 2.0, "ice": 2.0, "fighting": 0.5, "ground": 0.5,
		"flying": 2.0, "bug": 2.0, "steel": 0.5,
	},
	"ghost": {
		"normal": 0.0, "psychic": 2.0, "ghost": 2.0, "dark": 0.5,
	},
	"dragon": {
		"dragon": 2.0, "steel": 0.5, "fairy": 0.0,
	},
	"dark": {
		"fighting": 0.5, "psychic": 2.0, "ghost": 2.0,
		"dark": 0.5, "fairy": 0.5,
	},
	"steel": {
		"fire": 0.5, "water": 0.5, "electric": 0.5,
		"ice": 2.0, "rock": 2.0, "steel": 0.5, "fairy": 2.0,
	},
	"fairy": {
		"fire": 0.5, "poison": 0.5, "fighting": 2.0,
		"dragon": 2.0, "dark": 2.0, "steel": 0.5,
	},
}

func Effectiveness(attackType, defenderType string) float64 {
	if defenders, ok := TypeChart[attackType]; ok {
		if mult, ok := defenders[defenderType]; ok {
			return mult
		}
	}
	return 1.0
}

type MatchupResult struct {
	AttackType string  `json:"attackType"`
	Multiplier float64 `json:"multiplier"`
}

func CalculateWeaknesses(ctx context.Context, type1, type2 string) ([]MatchupResult, error) {
	results := make([]MatchupResult, 0, len(AllTypes))
	for _, atk := range AllTypes {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		mult := Effectiveness(atk, type1)
		if type2 != "" {
			mult *= Effectiveness(atk, type2)
		}
		results = append(results, MatchupResult{
			AttackType: atk,
			Multiplier: mult,
		})
	}
	return results, nil
}

func CalculateAttacking(ctx context.Context, attackType string) ([]MatchupResult, error) {
	results := make([]MatchupResult, 0, len(AllTypes))
	for _, def := range AllTypes {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		results = append(results, MatchupResult{
			AttackType: def,
			Multiplier: Effectiveness(attackType, def),
		})
	}
	return results, nil
}
