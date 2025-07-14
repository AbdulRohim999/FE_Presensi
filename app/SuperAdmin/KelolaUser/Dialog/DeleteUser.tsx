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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { deleteUser } from "@/lib/api";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  userId: number;
  userName: string;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  onSuccess,
}: DeleteUserDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      await deleteUser(token, userId);
      toast.success("User berhasil dihapus");
      onSuccess();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data user{" "}
            <span className="font-semibold">{userName}</span> secara permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
