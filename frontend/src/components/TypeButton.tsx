import { TYPE_COLORS } from "../constants";

interface TypeButtonProps {
  typeName: string;
  isSelected: boolean;
  onClick: () => void;
}

function TypeButton({ typeName, isSelected, onClick }: TypeButtonProps) {

    const displayName = typeName.charAt(0).toUpperCase() + typeName.slice(1);

    return (
    <button
      className={`type-btn ${isSelected ? "selected" : ""}`}
      style={{ backgroundColor: TYPE_COLORS[typeName] }}
      onClick={onClick}
    >
      {displayName}
    </button>
  );
}

export default TypeButton;
