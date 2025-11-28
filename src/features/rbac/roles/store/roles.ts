import { createCrudStore } from "@/shared/components/CrudTable/createCrudStore";

import { Role } from "../types";

export const useRolesStore = createCrudStore<Role>({
  endpoint: "roles",
});
