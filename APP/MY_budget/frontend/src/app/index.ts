export type UserProfileType = "jeune" | "adulte" | "senior";
export type UserProfile = {
  type: UserProfileType;
  age?: number;
  goal?: string; // objectif libre
};