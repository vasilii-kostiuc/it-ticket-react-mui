export type Permission = {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

export type PermissionCreateData = Omit<
  Permission,
  "id" | "created_at" | "updated_at"
>;

export type PermissionUpdateData = Partial<
  Omit<Permission, "id" | "created_at" | "updated_at">
>;
