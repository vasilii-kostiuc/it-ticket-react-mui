import { usePermissionsStore } from "../store/permissions";
import { Permission } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PermissionForm from "../components/PermissionForm";
import Box from "@mui/material/Box";
import PageContainer from "@/shared/components/PageContainer";

export default function PermissionCreate() {
  const navigate = useNavigate();
  const store = usePermissionsStore();
  const [formValues, setFormValues] = useState<Partial<Permission>>({});

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await store.createOne(formValues);
    navigate(`/permissions`);
  };

  return (
    <PageContainer
      title="Create Permission"
      breadcrumbs={[
        { title: "Users" },
        { title: "Permissions", path: "/permissions" },
        { title: "Create", path: `/permissions/create` },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <PermissionForm
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
