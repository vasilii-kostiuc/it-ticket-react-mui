export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: number[];
  created_at: string;
  updated_at: string;
};

export type RoleCreateData = Omit<Role, "id" | "created_at" | "updated_at">;

export type RoleUpdateData = Partial<
  Omit<Role, "id" | "created_at" | "updated_at">
>;
