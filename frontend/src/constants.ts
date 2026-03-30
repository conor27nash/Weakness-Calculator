// Must match backend's AllTypes order
export const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

export const TYPE_COLORS: Record<string, string> = {
  normal:   "#A8A77A",
  fire:     "#EE8130",
  water:    "#6390F0",
  electric: "#F7D02C",
  grass:    "#7AC74C",
  ice:      "#96D9D6",
  fighting: "#C22E28",
  poison:   "#A33EA1",
  ground:   "#E2BF65",
  flying:   "#A98FF3",
  psychic:  "#F95587",
  bug:      "#A6B91A",
  rock:     "#B6A136",
  ghost:    "#735797",
  dragon:   "#6F35FC",
  dark:     "#705746",
  steel:    "#B7B7CE",
  fairy:    "#D685AD",
};

export const MULTIPLIER_GROUPS = [
  { key: "4",    label: "4x Weak",          className: "quad-weak" },
  { key: "2",    label: "2x Weak",          className: "double-weak" },
  { key: "1",    label: "Neutral",          className: "neutral" },
  { key: "0.5",  label: "Resists",          className: "resist" },
  { key: "0.25", label: "Double Resists",   className: "double-resist" },
  { key: "0",    label: "Immune",           className: "immune" },
];
