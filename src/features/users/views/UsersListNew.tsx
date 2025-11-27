import { CrudTable, CrudTableStore } from "@/shared/components/CrudTable";
import { useUsersStore } from "@/features/users/store/users";
import { User } from "@/features/users/types";
import { GridColDef } from "node_modules/@mui/x-data-grid/esm/models/colDef/gridColDef";

// // Адаптер для вашего store к интерфейсу DataTable
// function useUsersDataTableStore(): CrudTableStore<User> {
//   const store = useUsersStore();

//   return {
//     items: store.users,
//     loading: store.loading,
//     error: store.error,
//     meta: store.meta,
//     params: store.params,
//     setParams: store.setParams,
//     fetchAll: store.fetchAll,
//     deleteOne: (id: number | string) => store.deleteUser(Number(id)),
//     deleteMany: (ids: (number | string)[]) => store.deleteMany(ids.map(Number)),
//   };
// }

// Определение колонок
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", type: "number", width: 80 },
  { field: "name", headerName: "Name", width: 140 },
  { field: "email", headerName: "Email", width: 200 },
  {
    field: "created_at",
    headerName: "Created At",
    width: 200,
    type: "dateTime",
    valueFormatter: (value) => new Date(value).toLocaleString(),
  },
  {
    field: "updated_at",
    headerName: "Updated At",
    type: "dateTime",
    width: 200,
    valueFormatter: (value) => new Date(value).toLocaleString(),
  },
];

export default function UsersListNew() {
  return (
    <CrudTable<User>
      title="Users"
      columns={columns}
      useStore={useUsersStore}
      basePath="/users"
      entityName="user"
      entityNamePlural="users"
      breadcrumbs={[{ title: "Users" }, { title: "Users", path: "/users" }]}
    />
  );
}
