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
import { useAuth } from "@/context/AuthContext";
import { deleteAdmin } from "@/lib/api";
import { AxiosError } from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Admin {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

interface DeleteAdminDialogProps {
  admin: Admin;
  onSuccess: () => void;
}

export function DeleteAdminDialog({
  admin,
  onSuccess,
}: DeleteAdminDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);
      await deleteAdmin(token, admin.idUser);
      toast.success("Admin berhasil dihapus");
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Gagal menghapus admin");
      } else {
        toast.error("Gagal menghapus admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Admin</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus admin {admin.firstname}{" "}
            {admin.lastname}? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
