import { createBrowserRouter } from "react-router";
import DashboardLayout from "./shared/layouts/DashboardLayout/DashboardLayout";
import EmployeeList from "./features/employees/EmployeeList";
import EmployeeShow from "./features/employees/EmployeeShow";
import EmployeeCreate from "./features/employees/EmployeeCreate";
import EmployeeEdit from "./features/employees/EmployeeEdit";
import SignUp from "./features/auth/views/SignUp";
import SignIn from "./features/auth/views/SignIn";
import UsersList from "./features/users/views/UsersList";
import PermissionsList from "./features/rbac/permissions/views/PermissionsList";
import RolesList from "./features/rbac/roles/views/RolesList";
import PermissionEdit from "./features/rbac/permissions/views/PermissionEdit";
import PermissionCreate from "./features/rbac/permissions/views/PermissionCreate";
import RoleCreate from "./features/rbac/roles/views/RoleCreate";
import RoleEdit from "./features/rbac/roles/views/RoleEdit";
import ProfileEdit from "./features/auth/views/profile/ProfileEdit";

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
      {
        path: "permissions",
        Component: PermissionsList,
      },
      {
        path: "permissions",
        Component: PermissionsList,
      },
      {
        path: "permissions/:id/edit",
        Component: PermissionEdit,
      },
      {
        path: "permissions/create",
        Component: PermissionCreate,
      },
      {
        path: "roles",
        Component: RolesList,
      },
      {
        path: "roles/:id/edit",
        Component: RoleEdit,
      },
      {
        path: "roles/create",
        Component: RoleCreate,
      },
      {
        path: "profile",
        Component: ProfileEdit,
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
