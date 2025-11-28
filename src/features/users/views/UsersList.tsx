import { CrudTable } from "@/shared/components/CrudTable";
import { useUsersStore } from "@/features/users/store/users";
import { User } from "@/features/users/types";
import { GridColDef } from "node_modules/@mui/x-data-grid/esm/models/colDef/gridColDef";
import { BaseColumns } from "@/shared/components/CrudTable/types";

const columns: GridColDef[] = [
  BaseColumns.id,
  { field: "name", headerName: "Name", width: 140 },
  { field: "email", headerName: "Email", width: 200 },
  BaseColumns.created_at,
  BaseColumns.updated_at,
];

export default function UsersList() {
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
