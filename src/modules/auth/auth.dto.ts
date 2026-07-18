export interface AuthResponseDTO {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  isBanned: boolean;
  isVerified: boolean;
}

export interface RegisterRequestDTO {
  name: string | null;
  email: string;
  password: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}
