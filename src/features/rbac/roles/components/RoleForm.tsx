import { Role } from "../types";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

interface RoleFormProps {
  formValues: Partial<Role>;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  mode: "create" | "edit";
  validationErrors?: Record<string, string[]> | null; // Laravel возвращает массивы
  generalError?: string | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitButtonLabel?: string;
}

export default function PermissionForm({
  formValues,
  onFieldChange,
  handleSubmit,
  mode,
  validationErrors,
  generalError,
  isLoading,
  isSubmitting,
  submitButtonLabel,
}: RoleFormProps) {
  // Универсальный обработчик для текстовых полей
  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onFieldChange(e.target.name, e.target.value);
  };

  const handleCheckboxFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    onFieldChange(event.target.name, checked);
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
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "block" }}>
            <TextField
              multiline
              value={formValues?.description ?? ""}
              onChange={handleTextFieldChange}
              name="description"
              label="Description"
              error={!!validationErrors?.description}
              helperText={validationErrors?.description?.[0] ?? " "}
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
