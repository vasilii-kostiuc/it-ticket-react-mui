import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { usePermissionsStore } from "@/features/rbac/permissions/store/permissions";

interface PermissionsSelectorProps {
  selectedPermissions: number[];
  onChange: (permissions: number[]) => void;
}

export default function PermissionsSelector({
  selectedPermissions,
  onChange,
}: PermissionsSelectorProps) {
  const { items: permissions, loading, fetchAll } = usePermissionsStore();

  const handleToggle = (permissionId: number) => {
    const newSelected = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];
    onChange(newSelected);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Grid size={{ xs: 6, sm: 6 }} spacing={2}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Role Permissions
        </Typography>
        <Grid container sx={{ mb: 2 }}>
          {permissions.map((permission) => (
            <Grid size={{ xs: 12, sm: 4, md: 3, xl: 2 }} key={permission.id}>
              <FormControlLabel
                key={permission.id}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handleToggle(permission.id)}
                  />
                }
                label={permission.name}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  );
}
