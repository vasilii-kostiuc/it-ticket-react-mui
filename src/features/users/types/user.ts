export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export type UserProfile = User & {
  avatar: string | null;
};

export type UserProfileUpdateData = Partial<
  Omit<UserProfile, "id" | "created_at" | "updated_at">
> & { avatar?: File | null };

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
