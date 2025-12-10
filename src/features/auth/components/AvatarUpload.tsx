import { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

function AvatarUpload({
  currentAvatar,
  onAvatarChange,
}: {
  currentAvatar: string;
  onAvatarChange: (file: File) => void;
}) {
  const [preview, setPreview] = useState(currentAvatar);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onAvatarChange(file);
    }
  };

  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar src={preview} sx={{ width: 100, height: 100 }} />
      <Button component="label" variant="outlined" startIcon={<PhotoCamera />}>
        Upload Photo
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );
}
export default AvatarUpload;
