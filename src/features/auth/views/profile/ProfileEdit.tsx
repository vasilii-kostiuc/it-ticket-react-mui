import { useAuthStore } from "@/features/auth/store/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../../components/ProfileForm";
import Box from "@mui/material/Box";
import PageContainer from "@/shared/components/PageContainer";
import useNotifications from "@/shared/hooks/useNotifications/useNotifications";

export default function PermissionEdit() {
  const navigate = useNavigate();
  const store = useAuthStore();
  const [formValues, setFormValues] = useState({});
  const notifications = useNotifications();

  useEffect(() => {
    async function fetchProfile() {
      const fetchedProfile = await store.fetchProfile();
      if (fetchedProfile) {
        setFormValues(fetchedProfile);
      }
    }

    fetchProfile();
  }, []);

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await store.updateProfile(formValues);
    notifications.show("Profile updated successfully.", {
      severity: "success",
      autoHideDuration: 3000,
    });
    navigate(`/profile`);
  };

  return (
    <PageContainer
      title={`Edit Profile`}
      breadcrumbs={[
        { title: "Profile" },
        { title: "Profile Edit", path: "/profile" },
      ]}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <ProfileForm
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
