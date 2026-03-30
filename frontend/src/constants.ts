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

export const GENERATIONS = [
  { label: "All", min: 0, max: Infinity },
  { label: "Gen 1", min: 1, max: 151 },
  { label: "Gen 2", min: 152, max: 251 },
  { label: "Gen 3", min: 252, max: 386 },
  { label: "Gen 4", min: 387, max: 493 },
  { label: "Gen 5", min: 494, max: 649 },
  { label: "Gen 6", min: 650, max: 721 },
  { label: "Gen 7", min: 722, max: 809 },
  { label: "Gen 8", min: 810, max: 905 },
  { label: "Gen 9", min: 906, max: 1025 },
];

export const MULTIPLIER_GROUPS = [
  { key: "4",    label: "4x Weak",          className: "quad-weak" },
  { key: "2",    label: "2x Weak",          className: "double-weak" },
  { key: "1",    label: "Neutral",          className: "neutral" },
  { key: "0.5",  label: "Resists",          className: "resist" },
  { key: "0.25", label: "Double Resists",   className: "double-resist" },
  { key: "0",    label: "Immune",           className: "immune" },
];
