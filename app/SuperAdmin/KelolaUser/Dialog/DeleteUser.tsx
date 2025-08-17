"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { deleteUser } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  userId: number;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const { token } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }

    // Trigger loading popup
    window.dispatchEvent(
      new CustomEvent("userAction", {
        detail: { action: "Menghapus User", type: "start" },
      })
    );

    try {
      await deleteUser(token, userId);

      // Trigger success popup
      window.dispatchEvent(
        new CustomEvent("userAction", {
          detail: { action: "Menghapus User", type: "success" },
        })
      );

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Trigger error popup
      window.dispatchEvent(
        new CustomEvent("userAction", {
          detail: { action: "Menghapus User", type: "error" },
        })
      );

      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
    }
  };

  // Fungsi untuk menampilkan dialog konfirmasi
  const handleShowConfirm = () => {
    setShowConfirmDialog(true);
  };

  // Fungsi untuk eksekusi setelah konfirmasi
  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    await handleDelete();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data user{" "}
            <span className="font-semibold">{userName}</span> secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={false}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleShowConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Dialog Konfirmasi */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin menghapus user ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialog>
  );
}
