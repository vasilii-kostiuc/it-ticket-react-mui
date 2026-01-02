import { useAuthStore } from "../../store/auth";
import PageContainer from "@/shared/components/PageContainer";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";

export default function ProfileView() {
  const { fetchProfile, userProfile } = useAuthStore();

  useEffect(() => {
    async function fetchPro() {
      await fetchProfile();
    }

    fetchPro();
  }, [fetchProfile]);

  return (
    <PageContainer
      title={`Profile`}
      breadcrumbs={[{ title: "Profile Edit", path: "/profile" }]}
    >
      <Box sx={{ display: "grid" }}>
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12, sm: 6 }}></Grid>
          <Grid size={{ xs: 12, sm: 6 }}></Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {userProfile?.name}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {userProfile?.email}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
