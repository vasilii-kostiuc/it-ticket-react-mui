import type { GridColDef } from "@mui/x-data-grid";

/**
 * Базовый интерфейс для store, совместимого с CrudTable
 * Любой store, использующий CrudTable, должен реализовывать этот интерфейс
 */
export interface CrudTableStore<T> {
  /** Массив элементов для отображения */
  items: T[];

  /** Состояние загрузки */
  loading: boolean;

  /** Сообщение об ошибке */
  error: string | null;

  /** Метаданные пагинации */
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };

  /** Параметры запроса */
  params: {
    page?: number;
    per_page?: number;
    filter?: Record<string, any>;
    sort?: string;
  };
  /** Навигационные ссылки для пагинации */
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  /** Установить параметры запроса */
  setParams: (params: Partial<CrudTableStore<T>["params"]>) => void;

  /** Загрузить все элементы */
  fetchAll: () => Promise<void>;

  /** Удалить один элемент по ID */
  deleteOne: (id: number | string) => Promise<void>;

  /** Массово удалить элементы по ID */
  deleteMany: (ids: (number | string)[]) => Promise<void>;
}

/**
 * Пропсы компонента CrudTable
 */
export interface CrudTableProps<T> {
  // Обязательные
  /** Заголовок таблицы */
  title: string;

  /** Конфигурация колонок */
  columns: GridColDef[];

  /** Хук для получения store */
  useStore: () => CrudTableStore<T>;

  // Опциональные
  /** Базовый путь для навигации (например, "/users") */
  basePath?: string;

  /** Поле ID в объекте (по умолчанию "id") */
  idField?: keyof T;

  /** Включить кнопку создания */
  enableCreate?: boolean;

  /** Включить действие редактирования */
  enableEdit?: boolean;

  /** Включить действие удаления */
  enableDelete?: boolean;

  /** Включить массовое удаление */
  enableBulkDelete?: boolean;

  /** Включить клик по строке */
  enableRowClick?: boolean;

  /** Показать чекбоксы выбора */
  checkboxSelection?: boolean;

  /** Хлебные крошки */
  breadcrumbs?: Array<{ title: string; path?: string }>;

  // Кастомные обработчики
  /** Обработчик клика по строке */
  onRowClick?: (row: T) => void;

  /** Обработчик редактирования */
  onEdit?: (row: T) => void;

  /** Обработчик удаления */
  onDelete?: (row: T) => Promise<void>;

  /** Обработчик массового удаления */
  onBulkDelete?: (rows: T[]) => Promise<void>;

  /** Обработчик создания */
  onCreate?: () => void;

  /** Дополнительные действия в header */
  additionalActions?: React.ReactNode;

  // Кастомизация названий
  /** Название сущности в единственном числе для сообщений */
  entityName?: string;

  /** Название сущности во множественном числе */
  entityNamePlural?: string;
}

export const BaseColumns: Record<string, GridColDef> = {
  id: { field: "id", headerName: "ID", type: "number", width: 80 },
  created_at: {
    field: "created_at",
    headerName: "Created At",
    width: 200,
    type: "dateTime",
    valueFormatter: (value) => new Date(value).toLocaleString(),
  },
  updated_at: {
    field: "updated_at",
    headerName: "Updated At",
    type: "dateTime",
    width: 200,
    valueFormatter: (value) => new Date(value).toLocaleString(),
  },
};
