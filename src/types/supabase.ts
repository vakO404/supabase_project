export interface Profile {
  id: string;
  email: string | null;
  role: "user" | "admin" | null;
}
