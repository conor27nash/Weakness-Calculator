import { useTypeCalculator } from "./hooks/useTypeCalculator";
import { useTeamBuilder } from "./hooks/useTeamBuilder";
import SelectedTypes from "./components/SelectedTypes";
import TypeGrid from "./components/TypeGrid";
import ResultsList from "./components/ResultsList";
import PokemonList from "./components/PokemonList";
import TeamBuilder from "./components/TeamBuilder";
import "./App.css";

function App() {
  const { selectedTypes, setTypes, toggleType, clearSelection, results, pokemon, pokemonLoading } =
    useTypeCalculator();
  const { team, analysis, suggestions, addToTeam, removeFromTeam, clearTeam } =
    useTeamBuilder();

  return (
    <div className="container">
      <h1>Pok&eacute;mon Type Calculator</h1>
      <div className="app-layout">
        <div className="results-column">
          <ResultsList results={results} />
        </div>
        <div className="app-main">
          <SelectedTypes selectedTypes={selectedTypes} onClear={clearSelection} />
          <TypeGrid selectedTypes={selectedTypes} onTypeClick={toggleType} />
          <PokemonList
            pokemon={pokemon}
            loading={pokemonLoading}
            selectedTypes={selectedTypes}
            onTypesChange={setTypes}
            onClearTypes={clearSelection}
            onAddToTeam={addToTeam}
            teamNames={team.map((s) => s.name)}
          />
        </div>
        <TeamBuilder
          team={team}
          analysis={analysis}
          suggestions={suggestions}
          onRemove={removeFromTeam}
          onClear={clearTeam}
        />
      </div>
    </div>
  );
}

export default App;
