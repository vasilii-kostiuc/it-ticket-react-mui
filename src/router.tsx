import { createBrowserRouter } from "react-router";
import DashboardLayout from "./components/layouts/DashboardLayout";
import EmployeeList from "./components/EmployeeList";
import EmployeeShow from "./components/EmployeeShow";
import EmployeeCreate from "./components/EmployeeCreate";
import EmployeeEdit from "./components/EmployeeEdit";
import SignUp from "./components/views/auth/SignUp";
import SignIn from "./components/views/auth/SignIn";
import UsersList from "./components/views/users/UsersList";

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
        Component: UsersList,
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
