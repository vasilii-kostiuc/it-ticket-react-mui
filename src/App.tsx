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
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth";

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function App(props: { disableCustomTheme?: boolean }) {
  const { initAuth, loading } = useAuthStore();

  // useEffect(() => {
  //   (async () => {
  //     await initAuth(); // Один раз при старте
  //   })();
  // }, []);

  // if (loading) return <CircularProgress />;
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
