import { Avatar, Box, Stack, Typography } from "@mui/material";
import OptionsMenu from "@/shared/layouts/DashboardLayout/components/OptionsMenu";
import { useAuthStore } from "@/features/auth/store/auth";

export default function DashboardSidebarAvatar() {
  const userProfile = useAuthStore((state) => state.userProfile);

  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        gap: 1,
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Avatar
        sizes="small"
        alt={userProfile?.name || ""}
        src={userProfile?.avatar || ""}
        sx={{ width: 36, height: 36 }}
      />
      <Box sx={{ mr: "auto" }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, lineHeight: "16px" }}
        >
          {userProfile?.name || ""}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {userProfile?.email || ""}
        </Typography>
      </Box>
      <OptionsMenu />
    </Stack>
  );
}
