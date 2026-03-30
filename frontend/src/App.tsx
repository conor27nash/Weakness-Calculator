import { useTypeCalculator } from "./hooks/useTypeCalculator";
import ModeToggle from "./components/ModeToggle";
import SelectedTypes from "./components/SelectedTypes";
import TypeGrid from "./components/TypeGrid";
import ResultsList from "./components/ResultsList";
import "./App.css";

function App() {
  const { mode, setMode, selectedTypes, toggleType, clearSelection, results } =
    useTypeCalculator();

  return (
    <div className="container">
      <h1>Pok&eacute;mon Type Calculator</h1>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <SelectedTypes selectedTypes={selectedTypes} mode={mode} onClear={clearSelection} />
      <TypeGrid selectedTypes={selectedTypes} onTypeClick={toggleType} />
      <ResultsList results={results} />
    </div>
  );
}

export default App;
