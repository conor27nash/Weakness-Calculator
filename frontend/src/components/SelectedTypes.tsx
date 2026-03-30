import type { Mode } from "../types";
import { TYPE_COLORS } from "../constants";

interface SelectedTypesProps {
  selectedTypes: string[];
  mode: Mode;
  onClear: () => void;
}

function SelectedTypes({ selectedTypes, mode, onClear }: SelectedTypesProps) {
  if (selectedTypes.length === 0) {
    const hint = mode === "defend" ? "Select 1 or 2 types" : "Select 1 type";
    return <p className="hint">{hint}</p>;
  }

  return (
    <div className="selected-types">
      {selectedTypes.map((typeName) => (
        <span
          key={typeName}
          className="type-badge"
          style={{ backgroundColor: TYPE_COLORS[typeName] }}
        >
          {typeName.charAt(0).toUpperCase() + typeName.slice(1)}
        </span>
      ))}
      <button className="clear-btn" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export default SelectedTypes;
