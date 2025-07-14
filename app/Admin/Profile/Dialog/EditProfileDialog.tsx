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
import { toast } from "@/components/ui/use-toast";
import {
  ProfileResponse,
  getProfilePhoto,
  updateUserProfilePhoto,
} from "@/lib/api";
import type React from "react";
import { useEffect, useState } from "react";

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

  // Fetch profile photo when dialog opens
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const photoData = await getProfilePhoto(token);
        setAvatarPreview(
          photoData.fotoProfileUrl || "/public/STTPayakumbuh.png"
        );
      } catch (error) {
        console.error("Error fetching profile photo:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil foto profil",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchProfilePhoto();
    }
  }, [open]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        throw new Error("Token tidak ditemukan");
      }

      if (!avatarFile) {
        toast({
          title: "Error",
          description: "Pilih foto profil terlebih dahulu",
          variant: "destructive",
        });
        return;
      }

      // Siapkan data untuk dikirim ke API
      const formData = new FormData();
      formData.append("file", avatarFile);

      // Upload foto profil
      await updateUserProfilePhoto(token, formData);

      // Update state di parent component
      onProfileUpdate({ ...profile, fotoProfile: avatarPreview });

      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diperbarui",
      });

      onOpenChange(false);

      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui foto profil",
        variant: "destructive",
      });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Foto Profil</DialogTitle>
          <DialogDescription>
            Pilih foto profil baru untuk mengganti foto profil Anda saat ini.
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
                accept="image/*"
                onChange={handleAvatarChange}
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
            <Button type="button" onClick={onSubmit} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
