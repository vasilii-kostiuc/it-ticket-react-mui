import { useRolesStore } from "../store/roles";
import { Role } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "@/shared/hooks/useNotifications/useNotifications";
import Box from "@mui/material/Box";
import PageContainer from "@/shared/components/PageContainer";
import RoleForm from "../components/RoleForm";

export default function RoleCreate() {
  const navigate = useNavigate();
  const store = useRolesStore();
  const [formValues, setFormValues] = useState<Partial<Role>>({});
  const notifications = useNotifications();

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdRole = await store.createOne(formValues);
    await store.updatePermissions(
      Number(createdRole.id),
      formValues.permissions || []
    );
    notifications.show("Role created successfully.", {
      severity: "success",
      autoHideDuration: 3000,
    });

    navigate(`/roles`);
  };

  return (
    <PageContainer
      title="Create Role"
      breadcrumbs={[
        { title: "Users" },
        { title: "Roles", path: "/roles" },
        { title: "Create", path: `/roles/create` },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <RoleForm
          formValues={formValues}
          onFieldChange={handleFieldChange}
          handleSubmit={handleSubmit}
          mode="create"
          validationErrors={store.validationErrors}
          generalError={store.error}
        />
      </Box>
    </PageContainer>
  );
}
