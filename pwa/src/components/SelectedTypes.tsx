import { TYPE_COLORS } from "../constants";

interface SelectedTypesProps {
  selectedTypes: string[];
  onClear: () => void;
}

function SelectedTypes({ selectedTypes, onClear }: SelectedTypesProps) {
  if (selectedTypes.length === 0) {
    return <p className="hint">Select 1 or 2 types</p>;
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
