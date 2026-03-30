import type { Mode } from "../types";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={mode === "defend" ? "active" : ""}
        onClick={() => onModeChange("defend")}
      >
        Defending
      </button>
      <button
        className={mode === "attack" ? "active" : ""}
        onClick={() => onModeChange("attack")}
      >
        Attacking
      </button>
    </div>
  );
}

export default ModeToggle;
