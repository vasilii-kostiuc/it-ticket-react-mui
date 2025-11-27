export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type UserCreateData = Omit<User, "id" | "created_at" | "updated_at"> & {
  password: string;
  password_confirmation: string;
};

export type UserUpdateData = Partial<
  Omit<User, "id" | "created_at" | "updated_at">
> & {
  password?: string;
  password_confirmation?: string;
};
