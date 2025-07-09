"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileResponse, updateUserProfilePhoto } from "@/lib/api";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditProfileDialogProps {
  profile: ProfileResponse;
  onProfileUpdate: (data: Partial<ProfileResponse>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  profile,
  onProfileUpdate,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] =
    useState<string>("/STTPayakumbuh.png");
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setAvatarFile(null);
      setAvatarPreview(profile.fotoProfileUrl || "/public/STTPayakumbuh.png");
    }
  }, [open, profile.fotoProfileUrl]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 2MB");
        return;
      }

      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau GIF");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        return;
      }

      if (!avatarFile) {
        toast.error("Pilih foto profil terlebih dahulu");
        return;
      }

      // Siapkan data untuk dikirim ke API
      const formData = new FormData();
      formData.append("file", avatarFile);

      // Kirim data ke API untuk update foto profil
      const response = await updateUserProfilePhoto(token, formData);

      // Update state di parent component dengan response yang baru
      onProfileUpdate({
        ...profile,
        fotoProfile: response.fotoProfile,
        fotoProfileUrl: response.fotoProfileUrl,
      });

      // Dispatch event untuk memberitahu navbar bahwa foto telah diperbarui
      window.dispatchEvent(new Event("profilePhotoUpdated"));

      toast.success("Foto profil berhasil diperbarui dan disimpan di MinIO");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile photo:", error);

      // Handle specific error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal memperbarui foto profil. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get initial for avatar fallback
  const getInitial = () => {
    if (profile?.firstname) {
      return profile.firstname.charAt(0).toUpperCase();
    }
    if (profile?.nip) {
      return profile.nip.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Foto Profil</DialogTitle>
          <DialogDescription>
            Pilih foto profil baru untuk mengganti foto profil Anda saat ini.
            Format yang didukung: JPG, PNG, GIF. Ukuran maksimal: 2MB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={avatarPreview}
                alt={profile?.firstname || "User"}
              />
              <AvatarFallback className="text-4xl">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="avatar">Pilih Foto</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !avatarFile}
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
