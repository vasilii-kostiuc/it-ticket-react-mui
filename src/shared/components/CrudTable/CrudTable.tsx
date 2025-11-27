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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "@/shared/hooks/useDialogs/useDialogs";
import useNotifications from "@/shared/hooks/useNotifications/useNotifications";
import PageContainer from "@/shared/components/PageContainer";

import type { CrudTableStore, CrudTableProps } from "./types";

const INITIAL_PAGE_SIZE = 10;

export function CrudTable<T extends Record<string, any>>({
  title,
  columns,
  useStore,
  basePath,
  idField = "id" as keyof T,
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  enableBulkDelete = true,
  enableRowClick = true,
  checkboxSelection = true,
  breadcrumbs,
  onRowClick,
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  additionalActions,
  entityName = "item",
  entityNamePlural = "items",
}: CrudTableProps<T>) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const store = useStore();
  const {
    items,
    loading,
    error,
    meta,
    setParams,
    fetchAll,
    deleteOne,
    deleteMany,
  } = store;

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
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  // Обработчики
  const handleRefresh = React.useCallback(() => {
    if (!loading) {
      fetchAll();
    }
  }, [loading, fetchAll]);

  const handleCreateClick = React.useCallback(() => {
    if (onCreate) {
      onCreate();
    } else if (basePath) {
      navigate(`${basePath}/create`);
    }
  }, [onCreate, basePath, navigate]);

  const handleRowEdit = React.useCallback(
    (row: T) => () => {
      if (onEdit) {
        onEdit(row);
      } else if (basePath) {
        navigate(`${basePath}/${row[idField]}/edit`);
      }
    },
    [onEdit, basePath, idField, navigate]
  );

  const handleRowDelete = React.useCallback(
    (row: T) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete this ${entityName}?`,
        {
          title: `Delete ${entityName}?`,
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        }
      );

      if (confirmed) {
        try {
          if (onDelete) {
            await onDelete(row);
          } else {
            await deleteOne(row[idField]);
          }

          notifications.show(
            `${
              entityName.charAt(0).toUpperCase() + entityName.slice(1)
            } deleted successfully.`,
            {
              severity: "success",
              autoHideDuration: 3000,
            }
          );
          fetchAll();
        } catch (deleteError) {
          notifications.show(
            `Failed to delete ${entityName}. Reason: ${
              (deleteError as Error).message
            }`,
            {
              severity: "error",
              autoHideDuration: 3000,
            }
          );
        }
      }
    },
    [dialogs, notifications, onDelete, deleteOne, fetchAll, entityName, idField]
  );

  const handleBulkDelete = React.useCallback(async () => {
    let selectedRows: T[];
    if (selectionModel.type === "exclude") {
      const excludedIds = new Set(selectionModel.ids);
      selectedRows = items.filter((item) => !excludedIds.has(item[idField]));
    } else {
      selectedRows = items.filter((item) =>
        selectionModel.ids.has(item[idField])
      );
    }

    if (selectedRows.length === 0) {
      notifications.show(`Please select ${entityNamePlural} to delete.`, {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${selectedRows.length} ${
        selectedRows.length === 1 ? entityName : entityNamePlural
      }?`,
      {
        title: `Delete ${entityNamePlural}?`,
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      }
    );

    if (confirmed) {
      try {
        if (onBulkDelete) {
          await onBulkDelete(selectedRows);
        } else {
          const ids = selectedRows.map((row) => row[idField]);
          await deleteMany(ids);
        }

        notifications.show(
          `${selectedRows.length} ${
            selectedRows.length === 1 ? entityName : entityNamePlural
          } deleted successfully.`,
          {
            severity: "success",
            autoHideDuration: 3000,
          }
        );
        setSelectionModel({ type: "include", ids: new Set() });
        fetchAll();
      } catch (deleteError) {
        notifications.show(
          `Failed to delete ${entityNamePlural}. Reason: ${
            (deleteError as Error).message
          }`,
          {
            severity: "error",
            autoHideDuration: 3000,
          }
        );
      }
    }
  }, [
    selectionModel,
    items,
    idField,
    dialogs,
    notifications,
    onBulkDelete,
    deleteMany,
    fetchAll,
    entityName,
    entityNamePlural,
  ]);

  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      setSelectionModel({ type: "include", ids: new Set() });

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

        const filterObject: Record<string, any> = {};
        model.items.forEach((item) => {
          const field = item.field;
          const operator = item.operator;

          switch (operator) {
            case "startsWith":
              filterObject[`${field}_starts`] = item.value;
              break;
            case "endsWith":
              filterObject[`${field}_ends`] = item.value;
              break;
            case "contains":
            case "equals":
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

  const handleRowClickEvent = React.useCallback<GridEventListener<"rowClick">>(
    ({ row }) => {
      if (onRowClick) {
        onRowClick(row);
      } else if (basePath && enableRowClick) {
        navigate(`${basePath}/${row[idField]}`);
      }
    },
    [onRowClick, basePath, enableRowClick, idField, navigate]
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
                `${sortItem.sort === "desc" ? "-" : ""}${sortItem.field}`
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
      setSelectionModel(newSelectionModel);
    },
    []
  );

  // Формирование колонок с действиями
  const gridColumns = React.useMemo<GridColDef[]>(() => {
    const cols: GridColDef[] = columns.map((col) => ({
      ...col,
      valueFormatter: col.valueFormatter
        ? (value: any, row: T, column: GridColDef, apiRef: any) =>
            col.valueFormatter!(value, row, column, apiRef)
        : undefined,
    }));

    if (enableEdit || enableDelete) {
      cols.push({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => {
          const actions = [];
          if (enableEdit) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label="Edit"
                onClick={handleRowEdit(row)}
              />
            );
          }
          if (enableDelete) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleRowDelete(row)}
              />
            );
          }
          return actions;
        },
      });
    }

    return cols;
  }, [columns, enableEdit, enableDelete, handleRowEdit, handleRowDelete]);

  // Инициализация
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
  }, [paginationModel, filterModel, sortModel]);

  // Инициализация при монтировании
  React.useEffect(() => {
    fetchAll();
  }, []);

  // Следим за изменениями location (при клике на breadcrumb)
  React.useEffect(() => {
    // Проверяем, очистились ли параметры URL
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const filter = searchParams.get("filter");
    const sort = searchParams.get("sort");

    const hasNoParams = !page && !pageSize && !filter && !sort;

    // Если параметров нет, но локальное состояние не в дефолтных значениях
    const needsReset =
      hasNoParams &&
      (paginationModel.page !== 0 ||
        paginationModel.pageSize !== INITIAL_PAGE_SIZE ||
        filterModel.items.length > 0 ||
        sortModel.length > 0);

    if (needsReset) {
      setPaginationModel({ page: 0, pageSize: INITIAL_PAGE_SIZE });
      setFilterModel({ items: [] });
      setSortModel([]);
      setParams({
        page: 1,
        per_page: INITIAL_PAGE_SIZE,
        filter: {},
        sort: undefined,
      });
      fetchAll();
    }
  }, [searchParams]);

  const selectedCount =
    selectionModel.type === "exclude"
      ? items.length - selectionModel.ids.size
      : selectionModel.ids.size;

  return (
    <PageContainer
      title={title}
      breadcrumbs={breadcrumbs || [{ title }]}
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
          {enableBulkDelete &&
            checkboxSelection &&
            (selectionModel.type === "exclude" ||
              selectionModel.ids.size > 0) && (
              <Button
                variant="contained"
                color="error"
                onClick={handleBulkDelete}
                startIcon={<DeleteIcon />}
              >
                Delete ({selectedCount})
              </Button>
            )}
          {additionalActions}
          {enableCreate && (
            <Button
              variant="contained"
              onClick={handleCreateClick}
              startIcon={<AddIcon />}
            >
              Create
            </Button>
          )}
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={items}
            rowCount={meta?.total || 0}
            columns={gridColumns}
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
            onRowClick={handleRowClickEvent}
            rowSelectionModel={checkboxSelection ? selectionModel : undefined}
            onRowSelectionModelChange={
              checkboxSelection ? handleSelectionModelChange : undefined
            }
            loading={loading}
            checkboxSelection={checkboxSelection}
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
                cursor: enableRowClick ? "pointer" : "default",
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
