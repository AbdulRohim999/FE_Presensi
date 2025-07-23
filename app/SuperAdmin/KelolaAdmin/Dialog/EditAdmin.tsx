"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api";
import { AxiosError } from "axios";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Admin {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  nip: string | null;
  tipeUser: string | null;
  status: string | null;
  bidangKerja: string | null;
  alamat: string | null;
  phoneNumber: string | null;
}

interface EditAdminDialogProps {
  admin: Admin;
  onSuccess: () => void;
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  status: string;
  alamat: string;
  phoneNumber: string;
  nip: string;
  tipeUser: string;
  bidangKerja: string;
}

// Then initialize with values from admin
const [formData, setFormData] = useState<FormData>({
  firstname: admin.firstname,
  lastname: admin.lastname,
  email: admin.email,
  status: admin.status || "Aktif",
  alamat: admin.alamat || "",
  phoneNumber: admin.phoneNumber || "",
  nip: admin.nip || "",
  tipeUser: admin.tipeUser || "",
  bidangKerja: admin.bidangKerja || ""
});

export function EditAdminDialog({ admin, onSuccess }: EditAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstname: admin.firstname,
    lastname: admin.lastname,
    email: admin.email,
    status: admin.status || "Aktif",
    alamat: admin.alamat || "",
    phoneNumber: admin.phoneNumber || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);
      await updateUser(token, admin.idUser, formData);
      toast.success("Data admin berhasil diperbarui");
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Gagal memperbarui data admin"
        );
      } else {
        toast.error("Gagal memperbarui data admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Admin</DialogTitle>
          <DialogDescription>
            Perbarui informasi admin yang ada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname">Nama Depan</Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Nama Belakang</Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Nomor Telepon</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
