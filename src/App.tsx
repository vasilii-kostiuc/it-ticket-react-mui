import CssBaseline from "@mui/material/CssBaseline";
import { RouterProvider } from "react-router";
import NotificationsProvider from "@/shared/hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "@/shared/hooks/useDialogs/DialogsProvider";
import AppTheme from "./shared/theme/AppTheme";
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from "./shared/theme/customizations";
import { router } from "./router";

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme
      {...props}
      themeComponents={themeComponents}
      disableCustomTheme={true}
    >
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
