import { usePermissionsStore } from "../store/permissions";
import { Permission } from "../types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PermissionForm from "../components/PermissionForm";
import Box from "@mui/material/Box";
import PageContainer from "@/shared/components/PageContainer";

export default function PermissionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = usePermissionsStore();
  const [formValues, setFormValues] = useState<Partial<Permission>>({});

  // Загружаем данные при монтировании
  useEffect(() => {
    async function fetchPermission() {
      if (id) {
        const fetchedPermission = await store.fetchOne(Number(id));
        setFormValues(fetchedPermission); // 👈 устанавливаем в formValues
      }
    }
    fetchPermission();
  }, [id]);

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await store.updateOne(Number(id), formValues);
      navigate(`/permissions`);
    }
  };

  return (
    <PageContainer
      title={`Edit Permission ${id}`}
      breadcrumbs={[
        { title: "Users" },
        { title: "Permissions", path: "/permissions" },
        { title: `${formValues.name}`, path: `/permissions/${id}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <PermissionForm
          formValues={formValues}
          onFieldChange={handleFieldChange}
          handleSubmit={handleSubmit}
          mode="edit"
          validationErrors={store.validationErrors}
          generalError={store.error}
        />
      </Box>
    </PageContainer>
  );
}
