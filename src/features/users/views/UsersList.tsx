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
  GridRowSelectionModel,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "@/shared/hooks/useDialogs/useDialogs";
import useNotifications from "@/shared/hooks/useNotifications/useNotifications";
// import {
//   deleteOne as deleteEmployee,
//   getMany as getEmployees,
//   type Employee,
// } from '../data/employees';

import { useUsersStore } from "@/features/users/store/users";

import PageContainer from "@/shared/components/PageContainer";
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

  const store = useUsersStore((state) => state);
  const setParams = useUsersStore((state) => state.setParams);
  const fetchAll = useUsersStore((state) => state.fetchAll);
  const deleteMany = useUsersStore((state) => state.deleteMany);

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

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  const [rowsState, setRowsState] = React.useState<{
    rows: User[];
    rowCount: number;
  }>({
    rows: [],
    rowCount: 0,
  });

  const handleRefresh = React.useCallback(() => {
    if (!store.loading) {
      fetchAll();
    }
  }, [store.loading, fetchAll]);

  const handleCreateClick = React.useCallback(() => {
    navigate("/users/create");
  }, [navigate]);

  const handleBulkDelete = React.useCallback(async () => {
    // Получаем список выбранных ID с учетом типа выделения
    let selectedIds: number[];
    if (selectionModel.type === "exclude") {
      // "exclude" = выбраны все, кроме ids
      const excludedIds = new Set(selectionModel.ids);
      selectedIds = store.users
        .filter((user) => !excludedIds.has(user.id))
        .map((user) => Number(user.id));
    } else {
      // "include" = выбраны только ids
      selectedIds = Array.from(selectionModel.ids) as number[];
    }

    if (selectedIds.length === 0) {
      notifications.show("Please select users to delete.", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${selectedIds.length} user(s)?`,
      {
        title: `Delete users?`,
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      }
    );

    if (confirmed) {
      try {
        await deleteMany(selectedIds);

        notifications.show(
          `${selectedIds.length} user(s) deleted successfully.`,
          {
            severity: "success",
            autoHideDuration: 3000,
          }
        );
        setSelectionModel({ type: "include", ids: new Set() });
        fetchAll();
      } catch (deleteError) {
        notifications.show(
          `Failed to delete users. Reason: ${(deleteError as Error).message}`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
      }
    }
  }, [selectionModel, dialogs, notifications, deleteMany, fetchAll]);

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
          fetchAll();
        } catch (deleteError) {
          notifications.show(
            `Failed to delete user. Reason:' ${(deleteError as Error).message}`,
            {
              severity: "error",
              autoHideDuration: 3000,
            }
          );
        }
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
      setSelectionModel({ type: "include", ids: new Set() }); // Сброс выделения при смене страницы

      setParams({
        page: model.page + 1,
        per_page: model.pageSize,
      });

      searchParams.set("page", String(model.page));
      searchParams.set("pageSize", String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
      fetchAll();
    },
    [navigate, pathname, searchParams, setParams, fetchAll]
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

        setParams({ filter: filterObject });
      } else {
        searchParams.delete("filter");
        setParams({ filter: undefined });
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );
      fetchAll();
    },
    [navigate, pathname, searchParams, setParams, fetchAll]
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
        setParams({
          sort: model
            .map(
              (sortItem) =>
                `${sortItem.sort == "desc" ? "-" : ""}${sortItem.field}`
            )
            .join(","),
        });
      } else {
        searchParams.delete("sort");
        setParams({ sort: undefined });
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`
      );

      fetchAll();
    },
    [navigate, pathname, searchParams, setParams, fetchAll]
  );
  const handleSelectionModelChange = React.useCallback(
    (newSelectionModel: GridRowSelectionModel) => {
      console.log("Selection changed:", newSelectionModel);
      setSelectionModel(newSelectionModel);
    },
    []
  );

  const pageTitle = "Users";

  // Инициализация параметров из URL при первой загрузке
  React.useEffect(() => {
    setParams({
      page: paginationModel.page + 1,
      per_page: paginationModel.pageSize,
      filter:
        filterModel.items.length > 0
          ? filterModel.items.reduce((acc, item) => {
              const field = item.field;
              const operator = item.operator;
              switch (operator) {
                case "startsWith":
                  acc[`${field}_starts`] = item.value;
                  break;
                case "endsWith":
                  acc[`${field}_ends`] = item.value;
                  break;
                case "contains":
                case "equals":
                default:
                  acc[field] = item.value;
              }
              return acc;
            }, {} as Record<string, any>)
          : undefined,
      sort:
        sortModel.length > 0
          ? sortModel
              .map(
                (sortItem) =>
                  `${sortItem.sort === "desc" ? "-" : ""}${sortItem.field}`
              )
              .join(",")
          : undefined,
    });
  }, []); // Только при монтировании

  React.useEffect(() => {
    fetchAll();
  }, []);

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: pageTitle }, { title: "Users", path: "/users" }]}
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
          {(selectionModel.type === "exclude" ||
            selectionModel.ids.size > 0) && (
            <Button
              variant="contained"
              color="error"
              onClick={handleBulkDelete}
              startIcon={<DeleteIcon />}
            >
              Delete (
              {selectionModel.type === "exclude"
                ? store.users.length - selectionModel.ids.size
                : selectionModel.ids.size}
              )
            </Button>
          )}
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
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={handleSelectionModelChange}
            loading={store.loading}
            initialState={initialState}
            showToolbar
            checkboxSelection
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
