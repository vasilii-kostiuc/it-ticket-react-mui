import { Permission } from "../types";
import { createCrudStore } from "@/shared/components/CrudTable/createCrudStore";

export const usePermissionsStore = createCrudStore<Permission>({
  endpoint: "permissions",
});
