package backend

import "context"

type TeamMember struct {
	Name  string   `json:"name"`
	Types []string `json:"types"`
}

type TypeCoverage struct {
	AttackType  string `json:"attackType"`
	WeakCount   int    `json:"weakCount"`
	ResistCount int    `json:"resistCount"`
	ImmuneCount int    `json:"immuneCount"`
}

type TeamAnalysis struct {
	Coverages []TypeCoverage `json:"coverages"`
	Uncovered []string       `json:"uncovered"`
}

type TypeSuggestion struct {
	Types []string `json:"types"`
	Score int      `json:"score"`
}

// AnalyzeTeam computes how the team handles each of the 18 attack types.
func AnalyzeTeam(ctx context.Context, team []TeamMember) (*TeamAnalysis, error) {
	analysis := &TeamAnalysis{
		Coverages: make([]TypeCoverage, 0, len(AllTypes)),
	}

	for _, atk := range AllTypes {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		cov := TypeCoverage{AttackType: atk}
		for _, member := range team {
			mult := Effectiveness(atk, member.Types[0])
			if len(member.Types) > 1 {
				mult *= Effectiveness(atk, member.Types[1])
			}
			if mult == 0 {
				cov.ImmuneCount++
			} else if mult > 1 {
				cov.WeakCount++
			} else if mult < 1 {
				cov.ResistCount++
			}
		}

		analysis.Coverages = append(analysis.Coverages, cov)

		// Uncovered = attack types where someone is weak but nobody resists or is immune
		if cov.WeakCount > 0 && cov.ResistCount == 0 && cov.ImmuneCount == 0 {
			analysis.Uncovered = append(analysis.Uncovered, atk)
		}
	}

	return analysis, nil
}

// SuggestTypes scores all single and dual type combinations by how many
// uncovered weaknesses they would resist, returning the top results.
func SuggestTypes(ctx context.Context, team []TeamMember) ([]TypeSuggestion, error) {
	analysis, err := AnalyzeTeam(ctx, team)
	if err != nil {
		return nil, err
	}

	if len(analysis.Uncovered) == 0 {
		return nil, nil
	}

	uncoveredSet := make(map[string]bool, len(analysis.Uncovered))
	for _, u := range analysis.Uncovered {
		uncoveredSet[u] = true
	}

	type candidate struct {
		types []string
		score int
	}

	var candidates []candidate

	// Score single types
	for _, t1 := range AllTypes {
		score := 0
		for atk := range uncoveredSet {
			mult := Effectiveness(atk, t1)
			if mult < 1 {
				score++
			}
		}
		if score > 0 {
			candidates = append(candidates, candidate{types: []string{t1}, score: score})
		}
	}

	// Score dual types
	for i, t1 := range AllTypes {
		for j := i + 1; j < len(AllTypes); j++ {
			t2 := AllTypes[j]
			score := 0
			for atk := range uncoveredSet {
				mult := Effectiveness(atk, t1) * Effectiveness(atk, t2)
				if mult < 1 {
					score++
				}
			}
			if score > 0 {
				candidates = append(candidates, candidate{types: []string{t1, t2}, score: score})
			}
		}
	}

	// Sort by score descending
	for i := 0; i < len(candidates); i++ {
		for j := i + 1; j < len(candidates); j++ {
			if candidates[j].score > candidates[i].score {
				candidates[i], candidates[j] = candidates[j], candidates[i]
			}
		}
	}

	// Return top 10
	limit := 10
	if len(candidates) < limit {
		limit = len(candidates)
	}

	suggestions := make([]TypeSuggestion, limit)
	for i := 0; i < limit; i++ {
		suggestions[i] = TypeSuggestion{
			Types: candidates[i].types,
			Score: candidates[i].score,
		}
	}

	return suggestions, nil
}
