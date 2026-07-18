export interface UserResponseDTO {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  isBanned: boolean;
  isVerified: boolean;
}
