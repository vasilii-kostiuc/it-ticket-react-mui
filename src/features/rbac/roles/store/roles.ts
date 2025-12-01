import { createCrudStore } from "@/shared/components/CrudTable/createCrudStore";

import { Role } from "../types";
import { CrudTableStore } from "@/shared/components/CrudTable";
import axios from "axios";

interface RoleStore extends CrudTableStore<Role> {
  updatePermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
}

const baseCrudRoleStore = createCrudStore<Role>({
  endpoint: "roles",
});

export const useRolesStore = (): RoleStore => {
  const store = baseCrudRoleStore();

  const updatePermissions = async (roleId: number, permissionIds: number[]) => {
    await axios.put(`roles/${roleId}/permissions`, {
      permissions: permissionIds,
    });
    await store.fetchAll();
  };

  return { ...store, updatePermissions };
};
