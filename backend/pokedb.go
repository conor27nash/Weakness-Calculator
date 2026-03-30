package backend

import (
	"bytes"
	"embed"
	"encoding/csv"
	"fmt"
	"io"
	"sort"
	"strconv"
	"strings"
)

//go:embed data/csv
var csvFS embed.FS

// DB is the global in-memory Pokémon database, initialised at startup.
var DB *PokeDB

// PokeDB holds all indexed Pokémon data parsed from CSV files.
type PokeDB struct {
	pokemonByID   map[int]*pokemonRecord
	pokemonByName map[string]*pokemonRecord

	typeNameByID     map[int]string
	typeIDByName     map[string]int
	pokemonIDsByType map[int][]int            // type_id -> []pokemon_id
	typesByPokemonID map[int][]string          // pokemon_id -> ordered type names

	statNameByID   map[int]string
	statsByPokemon map[int][]Stat

	abilityNameByID     map[int]string
	abilityDescByID     map[int]string
	abilityIDsByPokemon map[int][]int

	speciesByID      map[int]*speciesRecord
	speciesByChainID map[int][]*speciesRecord

	evolutionsByChainID map[int][]evolutionRecord
	triggerNameByID     map[int]string
	itemNameByID        map[int]string
	moveNameByID        map[int]string
	locationNameByID    map[int]string

	pokemonIDBySpeciesID map[int]int
}

type pokemonRecord struct {
	ID        int
	Name      string
	SpeciesID int
	Height    int
	Weight    int
}

type speciesRecord struct {
	ID                   int
	Name                 string
	EvolvesFromSpeciesID int
	EvolutionChainID     int
}

type evolutionRecord struct {
	EvolvedSpeciesID int
	TriggerID        int
	TriggerItemID    int
	MinLevel         int
	HeldItemID       int
	TimeOfDay        string
	KnownMoveID      int
	KnownMoveTypeID  int
	MinHappiness     int
	LocationID       int
}

// InitPokeDB loads all CSV data into memory. Must be called before serving requests.
func InitPokeDB() error {
	db := &PokeDB{
		pokemonByID:          make(map[int]*pokemonRecord),
		pokemonByName:        make(map[string]*pokemonRecord),
		typeNameByID:         make(map[int]string),
		typeIDByName:         make(map[string]int),
		pokemonIDsByType:     make(map[int][]int),
		typesByPokemonID:     make(map[int][]string),
		statNameByID:         make(map[int]string),
		statsByPokemon:       make(map[int][]Stat),
		abilityNameByID:      make(map[int]string),
		abilityDescByID:      make(map[int]string),
		abilityIDsByPokemon:  make(map[int][]int),
		speciesByID:          make(map[int]*speciesRecord),
		speciesByChainID:     make(map[int][]*speciesRecord),
		evolutionsByChainID:  make(map[int][]evolutionRecord),
		triggerNameByID:      make(map[int]string),
		itemNameByID:         make(map[int]string),
		moveNameByID:         make(map[int]string),
		locationNameByID:     make(map[int]string),
		pokemonIDBySpeciesID: make(map[int]int),
	}

	if err := db.loadTypes(); err != nil {
		return fmt.Errorf("types: %w", err)
	}
	if err := db.loadStats(); err != nil {
		return fmt.Errorf("stats: %w", err)
	}
	if err := db.loadTriggers(); err != nil {
		return fmt.Errorf("triggers: %w", err)
	}
	if err := db.loadItems(); err != nil {
		return fmt.Errorf("items: %w", err)
	}
	if err := db.loadMoves(); err != nil {
		return fmt.Errorf("moves: %w", err)
	}
	if err := db.loadLocations(); err != nil {
		return fmt.Errorf("locations: %w", err)
	}
	if err := db.loadAbilities(); err != nil {
		return fmt.Errorf("abilities: %w", err)
	}
	if err := db.loadAbilityProse(); err != nil {
		return fmt.Errorf("ability_prose: %w", err)
	}
	if err := db.loadSpecies(); err != nil {
		return fmt.Errorf("species: %w", err)
	}
	if err := db.loadPokemon(); err != nil {
		return fmt.Errorf("pokemon: %w", err)
	}
	if err := db.loadPokemonTypes(); err != nil {
		return fmt.Errorf("pokemon_types: %w", err)
	}
	if err := db.loadPokemonStats(); err != nil {
		return fmt.Errorf("pokemon_stats: %w", err)
	}
	if err := db.loadPokemonAbilities(); err != nil {
		return fmt.Errorf("pokemon_abilities: %w", err)
	}
	if err := db.loadEvolutions(); err != nil {
		return fmt.Errorf("evolutions: %w", err)
	}

	DB = db
	return nil
}

// ---------------------------------------------------------------------------
// CSV loading helpers
// ---------------------------------------------------------------------------

func readCSV(name string) ([]map[string]string, error) {
	data, err := csvFS.ReadFile("data/csv/" + name)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", name, err)
	}

	reader := csv.NewReader(bytes.NewReader(data))
	reader.LazyQuotes = true

	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("headers %s: %w", name, err)
	}

	var rows []map[string]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("row %s: %w", name, err)
		}
		row := make(map[string]string, len(headers))
		for i, h := range headers {
			if i < len(record) {
				row[h] = record[i]
			}
		}
		rows = append(rows, row)
	}
	return rows, nil
}

func atoi(s string) int {
	n, _ := strconv.Atoi(s)
	return n
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

func (db *PokeDB) loadTypes() error {
	rows, err := readCSV("types.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		id := atoi(r["id"])
		name := r["identifier"]
		db.typeNameByID[id] = name
		db.typeIDByName[name] = id
	}
	return nil
}

func (db *PokeDB) loadStats() error {
	rows, err := readCSV("stats.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.statNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadTriggers() error {
	rows, err := readCSV("evolution_triggers.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.triggerNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadItems() error {
	rows, err := readCSV("items.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.itemNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadMoves() error {
	rows, err := readCSV("moves.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.moveNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadLocations() error {
	rows, err := readCSV("locations.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.locationNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadAbilities() error {
	rows, err := readCSV("abilities.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		db.abilityNameByID[atoi(r["id"])] = r["identifier"]
	}
	return nil
}

func (db *PokeDB) loadAbilityProse() error {
	rows, err := readCSV("ability_prose.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		if r["local_language_id"] == "9" { // English
			db.abilityDescByID[atoi(r["ability_id"])] = r["short_effect"]
		}
	}
	return nil
}

func (db *PokeDB) loadSpecies() error {
	rows, err := readCSV("pokemon_species.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		sp := &speciesRecord{
			ID:                   atoi(r["id"]),
			Name:                 r["identifier"],
			EvolvesFromSpeciesID: atoi(r["evolves_from_species_id"]),
			EvolutionChainID:     atoi(r["evolution_chain_id"]),
		}
		db.speciesByID[sp.ID] = sp
		db.speciesByChainID[sp.EvolutionChainID] = append(db.speciesByChainID[sp.EvolutionChainID], sp)
	}
	return nil
}

func (db *PokeDB) loadPokemon() error {
	rows, err := readCSV("pokemon.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		if r["is_default"] != "1" {
			continue
		}
		p := &pokemonRecord{
			ID:        atoi(r["id"]),
			Name:      r["identifier"],
			SpeciesID: atoi(r["species_id"]),
			Height:    atoi(r["height"]),
			Weight:    atoi(r["weight"]),
		}
		db.pokemonByID[p.ID] = p
		db.pokemonByName[p.Name] = p
		db.pokemonIDBySpeciesID[p.SpeciesID] = p.ID
	}
	return nil
}

func (db *PokeDB) loadPokemonTypes() error {
	rows, err := readCSV("pokemon_types.csv")
	if err != nil {
		return err
	}

	// Collect types per pokemon, keyed by slot for ordering
	type slotEntry struct {
		slot   int
		typeID int
	}
	byPokemon := make(map[int][]slotEntry)

	for _, r := range rows {
		pid := atoi(r["pokemon_id"])
		if db.pokemonByID[pid] == nil {
			continue // skip non-default forms
		}
		tid := atoi(r["type_id"])
		slot := atoi(r["slot"])
		byPokemon[pid] = append(byPokemon[pid], slotEntry{slot, tid})
		db.pokemonIDsByType[tid] = append(db.pokemonIDsByType[tid], pid)
	}

	for pid, entries := range byPokemon {
		sort.Slice(entries, func(i, j int) bool { return entries[i].slot < entries[j].slot })
		types := make([]string, len(entries))
		for i, e := range entries {
			types[i] = db.typeNameByID[e.typeID]
		}
		db.typesByPokemonID[pid] = types
	}
	return nil
}

func (db *PokeDB) loadPokemonStats() error {
	rows, err := readCSV("pokemon_stats.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		pid := atoi(r["pokemon_id"])
		if db.pokemonByID[pid] == nil {
			continue
		}
		statID := atoi(r["stat_id"])
		db.statsByPokemon[pid] = append(db.statsByPokemon[pid], Stat{
			Name:  db.statNameByID[statID],
			Value: atoi(r["base_stat"]),
		})
	}
	return nil
}

func (db *PokeDB) loadPokemonAbilities() error {
	rows, err := readCSV("pokemon_abilities.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		pid := atoi(r["pokemon_id"])
		if db.pokemonByID[pid] == nil {
			continue
		}
		db.abilityIDsByPokemon[pid] = append(db.abilityIDsByPokemon[pid], atoi(r["ability_id"]))
	}
	return nil
}

func (db *PokeDB) loadEvolutions() error {
	rows, err := readCSV("pokemon_evolution.csv")
	if err != nil {
		return err
	}
	for _, r := range rows {
		speciesID := atoi(r["evolved_species_id"])
		sp := db.speciesByID[speciesID]
		if sp == nil {
			continue
		}
		evo := evolutionRecord{
			EvolvedSpeciesID: speciesID,
			TriggerID:        atoi(r["evolution_trigger_id"]),
			TriggerItemID:    atoi(r["trigger_item_id"]),
			MinLevel:         atoi(r["minimum_level"]),
			HeldItemID:       atoi(r["held_item_id"]),
			TimeOfDay:        r["time_of_day"],
			KnownMoveID:      atoi(r["known_move_id"]),
			KnownMoveTypeID:  atoi(r["known_move_type_id"]),
			MinHappiness:     atoi(r["minimum_happiness"]),
			LocationID:       atoi(r["location_id"]),
		}
		db.evolutionsByChainID[sp.EvolutionChainID] = append(db.evolutionsByChainID[sp.EvolutionChainID], evo)
	}
	return nil
}

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

func spriteURL(id int) string {
	return fmt.Sprintf("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/%d.png", id)
}

// QueryAllPokemon returns all default-form Pokémon sorted by ID.
func (db *PokeDB) QueryAllPokemon() []Pokemon {
	result := make([]Pokemon, 0, len(db.pokemonByID))
	for _, p := range db.pokemonByID {
		result = append(result, Pokemon{
			ID:        p.ID,
			Name:      p.Name,
			SpriteURL: spriteURL(p.ID),
			Types:     db.typesByPokemonID[p.ID],
		})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].ID < result[j].ID })
	return result
}

// QueryPokemonByTypes returns all default-form Pokémon matching the given type(s).
func (db *PokeDB) QueryPokemonByTypes(type1, type2 string) ([]Pokemon, error) {
	tid1, ok := db.typeIDByName[type1]
	if !ok {
		return nil, fmt.Errorf("unknown type: %s", type1)
	}

	if type2 == "" {
		ids := db.pokemonIDsByType[tid1]
		result := make([]Pokemon, 0, len(ids))
		for _, pid := range ids {
			p := db.pokemonByID[pid]
			result = append(result, Pokemon{
				ID:        p.ID,
				Name:      p.Name,
				SpriteURL: spriteURL(p.ID),
				Types:     db.typesByPokemonID[pid],
			})
		}
		return result, nil
	}

	tid2, ok := db.typeIDByName[type2]
	if !ok {
		return nil, fmt.Errorf("unknown type: %s", type2)
	}

	set := make(map[int]bool, len(db.pokemonIDsByType[tid1]))
	for _, pid := range db.pokemonIDsByType[tid1] {
		set[pid] = true
	}

	var result []Pokemon
	for _, pid := range db.pokemonIDsByType[tid2] {
		if set[pid] {
			p := db.pokemonByID[pid]
			result = append(result, Pokemon{
				ID:        p.ID,
				Name:      p.Name,
				SpriteURL: spriteURL(p.ID),
				Types:     db.typesByPokemonID[pid],
			})
		}
	}
	return result, nil
}

// QueryPokemonDetail returns the full detail for a Pokémon by name.
func (db *PokeDB) QueryPokemonDetail(name string) (*PokemonDetail, error) {
	p, ok := db.pokemonByName[name]
	if !ok {
		return nil, fmt.Errorf("pokemon not found: %s", name)
	}

	detail := &PokemonDetail{
		ID:        p.ID,
		Name:      p.Name,
		SpriteURL: spriteURL(p.ID),
		Types:     db.typesByPokemonID[p.ID],
		Height:    p.Height,
		Weight:    p.Weight,
		Stats:     db.statsByPokemon[p.ID],
	}

	for _, abilID := range db.abilityIDsByPokemon[p.ID] {
		detail.Abilities = append(detail.Abilities, Ability{
			Name:        db.abilityNameByID[abilID],
			Description: db.abilityDescByID[abilID],
		})
	}

	sp := db.speciesByID[p.SpeciesID]
	if sp != nil {
		detail.Evolutions = db.buildEvolutionChain(sp.EvolutionChainID)
	}
	if detail.Evolutions == nil {
		detail.Evolutions = [][]Evolution{}
	}

	return detail, nil
}

// ---------------------------------------------------------------------------
// Evolution chain builder
// ---------------------------------------------------------------------------

type evoNode struct {
	speciesID int
	name      string
	pokemonID int
	method    string
	children  []*evoNode
}

func (db *PokeDB) buildEvolutionChain(chainID int) [][]Evolution {
	chainSpecies := db.speciesByChainID[chainID]
	if len(chainSpecies) == 0 {
		return nil
	}

	nodes := make(map[int]*evoNode, len(chainSpecies))
	var root *evoNode
	for _, sp := range chainSpecies {
		pid := db.pokemonIDBySpeciesID[sp.ID]
		node := &evoNode{
			speciesID: sp.ID,
			name:      sp.Name,
			pokemonID: pid,
		}
		nodes[sp.ID] = node
		if sp.EvolvesFromSpeciesID == 0 {
			root = node
		}
	}

	if root == nil {
		return nil
	}

	// Link children and attach evolution methods
	for _, sp := range chainSpecies {
		if sp.EvolvesFromSpeciesID == 0 {
			continue
		}
		parent := nodes[sp.EvolvesFromSpeciesID]
		if parent == nil {
			continue
		}
		child := nodes[sp.ID]

		for _, evo := range db.evolutionsByChainID[chainID] {
			if evo.EvolvedSpeciesID == sp.ID {
				child.method = db.fmtEvoMethod(evo)
				break
			}
		}

		parent.children = append(parent.children, child)
	}

	return walkEvoPaths(root)
}

func walkEvoPaths(node *evoNode) [][]Evolution {
	current := Evolution{
		Name:      node.name,
		SpriteURL: spriteURL(node.pokemonID),
		Method:    node.method,
	}

	if len(node.children) == 0 {
		return [][]Evolution{{current}}
	}

	var paths [][]Evolution
	for _, child := range node.children {
		for _, subPath := range walkEvoPaths(child) {
			path := make([]Evolution, 0, 1+len(subPath))
			path = append(path, current)
			path = append(path, subPath...)
			paths = append(paths, path)
		}
	}
	return paths
}

func (db *PokeDB) fmtEvoMethod(evo evolutionRecord) string {
	trigger := db.triggerNameByID[evo.TriggerID]

	switch trigger {
	case "level-up":
		if evo.MinLevel > 0 {
			return fmt.Sprintf("Level %d", evo.MinLevel)
		}
		if evo.MinHappiness > 0 {
			s := "Happiness"
			if evo.TimeOfDay != "" {
				s += " (" + evo.TimeOfDay + ")"
			}
			return s
		}
		if evo.KnownMoveID > 0 {
			return "Know " + formatName(db.moveNameByID[evo.KnownMoveID])
		}
		if evo.KnownMoveTypeID > 0 {
			return "Know " + formatName(db.typeNameByID[evo.KnownMoveTypeID]) + " move"
		}
		if evo.LocationID > 0 {
			return "At " + formatName(db.locationNameByID[evo.LocationID])
		}
		return "Level up"
	case "use-item":
		if evo.TriggerItemID > 0 {
			return formatName(db.itemNameByID[evo.TriggerItemID])
		}
		return "Use item"
	case "trade":
		if evo.HeldItemID > 0 {
			return "Trade holding " + formatName(db.itemNameByID[evo.HeldItemID])
		}
		return "Trade"
	default:
		return formatName(trigger)
	}
}

func formatName(name string) string {
	return strings.ReplaceAll(name, "-", " ")
}
