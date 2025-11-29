import { useRolesStore } from "../store/roles";
import { Role } from "../types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PermissionForm from "../components/RoleForm";
import Box from "@mui/material/Box";
import PageContainer from "@/shared/components/PageContainer";
import RoleForm from "../components/RoleForm";

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useRolesStore();
  const [formValues, setFormValues] = useState<Partial<Role>>({});
  useEffect(() => {
    async function fetchRole() {
      if (id) {
        const fetchedRole = await store.fetchOne(id);
        setFormValues(fetchedRole);
      }
    }

    fetchRole();
  }, [id]);

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await store.updateOne(Number(id), formValues);
      navigate(`/roles`);
    }
  };

  return (
    <PageContainer
      title={`Edit Role ${id}`}
      breadcrumbs={[
        { title: "Users" },
        { title: "Roles", path: "/roles" },
        { title: `${formValues.name}`, path: `/roles/${id}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <RoleForm
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
