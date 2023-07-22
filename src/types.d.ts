import { roles } from "./constants";

export type Role = (typeof roles)[keyof roles];

export type team = "RED" | "BLUE";
