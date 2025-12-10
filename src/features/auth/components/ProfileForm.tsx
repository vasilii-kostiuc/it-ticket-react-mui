import {
  UserProfile,
  UserProfileUpdateData,
} from "@/features/users/types/user";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useState } from "react";
import AvatarUpload from "./AvatarUpload";

interface ProfileFormProps {
  formValues: Partial<UserProfileUpdateData>;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  mode: "create" | "edit";
  validationErrors?: Record<string, string[]> | null; // Laravel возвращает массивы
  generalError?: string | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitButtonLabel?: string;
}

export default function ProfileForm({
  formValues,
  onFieldChange,
  handleSubmit,
  mode,
  validationErrors,
  generalError,
  isLoading,
  isSubmitting,
  submitButtonLabel,
}: ProfileFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(e.target.name, e.target.value);
  };

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    onFieldChange("avatar", file);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      sx={{ width: "100%" }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: "100%" }}>
          <Grid
            item
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "center", md: "left" },
              mb: 2,
            }}
          >
            <AvatarUpload
              currentAvatar={formValues?.avatar}
              onAvatarChange={handleAvatarChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues?.name ?? ""}
              onChange={handleTextFieldChange}
              name="name"
              label="Name"
              error={!!validationErrors?.name}
              helperText={validationErrors?.name?.[0] ?? " "}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
            <TextField
              value={formValues?.email ?? ""}
              onChange={handleTextFieldChange}
              name="email"
              label="Email"
              type="email"
              error={!!validationErrors?.email}
              helperText={validationErrors?.email?.[0] ?? " "}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormGroup>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
        >
          {submitButtonLabel || (mode === "create" ? "Create" : "Save")}
        </Button>
      </Stack>
    </Box>
  );
}
