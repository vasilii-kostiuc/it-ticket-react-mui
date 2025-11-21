import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridEventListener,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
// import {
//   deleteOne as deleteEmployee,
//   getMany as getEmployees,
//   type Employee,
// } from '../data/employees';

import { useUsersStore } from "@/stores/users";

import PageContainer from "@/components/PageContainer";
import { User } from "@/models/user";

const INITIAL_PAGE_SIZE = 10;

export default function UsersList() {
  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    []
  );

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : INITIAL_PAGE_SIZE,
    });
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] }
  );
  const [sortModel, setSortModel] = React.useState<GridSortModel>(
    searchParams.get("sort") ? JSON.parse(searchParams.get("sort") ?? "") : []
  );

  const [rowsState, setRowsState] = React.useState<{
    rows: User[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const store = useUsersStore((state) => state);

  const handleRefresh = React.useCallback(() => {
    if (!store.loading) {
      store.fetchAll();
    }
  }, [store.loading, store.fetchAll]);

  const handleCreateClick = React.useCallback(() => {
    navigate("/users/create");
  }, [navigate]);

  const handleRowEdit = React.useCallback(
    (user: User) => () => {
      navigate(`/users/${user.id}/edit`);
    },
    [navigate]
  );

  const handleRowDelete = React.useCallback(
    (user: User) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${user.name}?`,
        {
          title: `Delete user?`,
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        }
      );

      if (confirmed) {
        try {
          await store.deleteUser(Number(user.id));

          notifications.show("User deleted successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          store.fetchAll();
        } catch (deleteError) {
          notifications.show(
            `Failed to delete user. Reason:' ${(deleteError as Error).message}`,
            {
              severity: "error",
              autoHideDuration: 3000,
            }
          );
        }
        store.loading = false;
      }
    },
    [dialogs, notifications, store]
  );

  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", type: "number" },
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
      {
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit-item"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete]
  );

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);

      store.params.page = model.page + 1;
      store.params.per_page = model.pageSize;

      searchParams.set("page", String(model.page));
      searchParams.set("pageSize", String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
      store.fetchAll();
    },
    [navigate, pathname, searchParams]
  );

  const handleFilterModelChange = React.useCallback(
    (model: GridFilterModel) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set("filter", JSON.stringify(model));

        // Преобразуем GridFilterModel в формат для Spatie: { field: value }
        const filterObject: Record<string, any> = {};
        model.items.forEach((item) => {
          const field = item.field;

          const operator = item.operator; // 'contains', 'equals', 'startsWith', 'endsWith'

          switch (operator) {
            case "startsWith":
              filterObject[`${field}_starts`] = item.value;
              break;
            case "endsWith":
              filterObject[`${field}_ends`] = item.value;
              break;
            case "contains":
              filterObject[field] = item.value; // partial filter
              break;
            case "equals":
              filterObject[field] = item.value; // exact filter
              break;
            default:
              filterObject[field] = item.value;
          }
        });

        store.params.filter = filterObject;
      } else {
        searchParams.delete("filter");
        store.params.filter = undefined;
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
      store.fetchAll();
    },
    [navigate, pathname, searchParams]
  );

  const handleRowClick = React.useCallback<GridEventListener<"rowClick">>(
    ({ row }) => {
      navigate(`/users/${row.id}`);
    },
    [navigate]
  );

  const handleSortModelChange = React.useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set("sort", JSON.stringify(model));
        store.params.sort = model
          .map(
            (sortItem) =>
              `${sortItem.sort == "desc" ? "-" : ""}${sortItem.field}`
          )
          .join(",");
      } else {
        searchParams.delete("sort");
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );

      store.fetchAll();
    },
    [navigate, pathname, searchParams]
  );

  const pageTitle = "Users";

  React.useEffect(() => {
    store.fetchAll();
  }, [store.fetchAll]);

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Reload data" placement="right" enterDelay={1000}>
            <div>
              <IconButton
                size="small"
                aria-label="refresh"
                onClick={handleRefresh}
              >
                <RefreshIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleCreateClick}
            startIcon={<AddIcon />}
          >
            Create
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {store.error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{store.error}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={store.users}
            rowCount={store.meta?.total || 0}
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={store.loading}
            initialState={initialState}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: "none",
                },
              [`& .${gridClasses.row}:hover`]: {
                cursor: "pointer",
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
              baseIconButton: {
                size: "small",
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
