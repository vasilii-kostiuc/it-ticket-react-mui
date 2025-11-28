import { User } from "../types/user";
import { createCrudStore } from "@/shared/components/CrudTable/createCrudStore";

export const useUsersStore = createCrudStore<User>({
  endpoint: "users",
});
