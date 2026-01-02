import { Avatar, Box, Stack, Typography } from "@mui/material";
import OptionsMenu from "@/shared/layouts/DashboardLayout/components/OptionsMenu";
import { useAuthStore } from "@/features/auth/store/auth";
import { useEffect } from "react";

export default function DashboardSidebarAvatar() {
  const { userProfile, fetchProfile } = useAuthStore();

  useEffect(() => {
    async function fetchPro() {
      await fetchProfile();
    }
    if (!userProfile) {
      fetchPro();
    }
  }, []);

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
