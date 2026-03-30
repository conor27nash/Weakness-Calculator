import { ALL_TYPES } from "../constants";
import TypeButton from "./TypeButton";

interface TypeGridProps {
  selectedTypes: string[];              // currently selected types
  onTypeClick: (typeName: string) => void;  // called when a type is clicked
}

function TypeGrid({ selectedTypes, onTypeClick }: TypeGridProps) {
  return (
    <div className="type-grid">
      {ALL_TYPES.map((typeName) => (
        <TypeButton
          key={typeName}
          typeName={typeName}
          isSelected={selectedTypes.includes(typeName)}
          onClick={() => onTypeClick(typeName)}
        />
      ))}
    </div>
  );
}

export default TypeGrid;
