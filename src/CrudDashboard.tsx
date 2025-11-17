import CssBaseline from "@mui/material/CssBaseline";
import { createBrowserRouter, RouterProvider } from "react-router";
import DashboardLayout from "./components/layouts/DashboardLayout";
import EmployeeList from "./components/EmployeeList";
import EmployeeShow from "./components/EmployeeShow";
import EmployeeCreate from "./components/EmployeeCreate";
import EmployeeEdit from "./components/EmployeeEdit";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "@/hooks/useDialogs/DialogsProvider";
import AppTheme from "./shared-theme/AppTheme";
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from "./theme/customizations";
import SignUp from "./components/views/SignUp";
import SignIn from "./components/views/SignIn";

const router = createBrowserRouter([
  {
    path: "/register",
    Component: SignUp,
  },
  {
    path: "/login",
    Component: SignIn,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: EmployeeList,
      },
      {
        path: "employees",
        Component: EmployeeList,
      },
      {
        path: "employees/:employeeId",
        Component: EmployeeShow,
      },
      {
        path: "employees/new",
        Component: EmployeeCreate,
      },
      {
        path: "employees/:employeeId/edit",
        Component: EmployeeEdit,
      },
    ],
  },
  {
    path: "*",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: EmployeeList,
      },
    ],
  },
]);
const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
