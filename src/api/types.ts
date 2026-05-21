export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  error?: string;
}

export interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface GetUserResponse {
  data: UserData;
  support: { url: string; text: string };
}

export interface UpdateUserRequest {
  name?: string;
  job?: string;
}

export interface UpdateUserResponse {
  name: string;
  job: string;
  updatedAt: string;
}
