import { CrudTable } from "@/shared/components/CrudTable";
import { GridColDef } from "node_modules/@mui/x-data-grid/esm/models/colDef/gridColDef";
import { Permission } from "../types";
import { usePermissionsStore } from "../store/permissions";
import { BaseColumns } from "@/shared/components/CrudTable/types";

// Определение колонок
const columns: GridColDef[] = [
  BaseColumns.id,
  { field: "name", headerName: "Name", width: 140 },
  { field: "display_name", headerName: "Display Name", width: 200 },
  BaseColumns.created_at,
  BaseColumns.updated_at,
];

export default function PermissionsList() {
  return (
    <CrudTable<Permission>
      title="Permissions"
      columns={columns}
      useStore={usePermissionsStore}
      basePath="/permissions"
      entityName="permission"
      entityNamePlural="permissions"
      breadcrumbs={[
        { title: "Users" },
        { title: "Permissions", path: "/permissions" },
      ]}
    />
  );
}
