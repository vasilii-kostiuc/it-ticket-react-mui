import { CrudTable } from "@/shared/components/CrudTable";
import { GridColDef } from "node_modules/@mui/x-data-grid/esm/models/colDef/gridColDef";
import { Role } from "../types";
import { BaseColumns } from "@/shared/components/CrudTable/types";
import { useRolesStore } from "../store/roles";

// Определение колонок
const columns: GridColDef[] = [
  BaseColumns.id,
  { field: "name", headerName: "Name", width: 140 },
  { field: "description", headerName: "Description", width: 200 },
  BaseColumns.created_at,
  BaseColumns.updated_at,
];

export default function RolesList() {
  return (
    <CrudTable<Role>
      title="Roles"
      columns={columns}
      useStore={useRolesStore}
      basePath="/roles"
      entityName="role"
      entityNamePlural="roles"
      breadcrumbs={[{ title: "Users" }, { title: "Roles", path: "/roles" }]}
    />
  );
}
