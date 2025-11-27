import { createBrowserRouter } from "react-router";
import DashboardLayout from "./shared/layouts/DashboardLayout/DashboardLayout";
import EmployeeList from "./features/employees/EmployeeList";
import EmployeeShow from "./features/employees/EmployeeShow";
import EmployeeCreate from "./features/employees/EmployeeCreate";
import EmployeeEdit from "./features/employees/EmployeeEdit";
import SignUp from "./features/auth/views/SignUp";
import SignIn from "./features/auth/views/SignIn";
import UsersListNew from "./features/users/views/UsersListNew";

export const router = createBrowserRouter([
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
      {
        path: "users",
        Component: UsersListNew,
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
