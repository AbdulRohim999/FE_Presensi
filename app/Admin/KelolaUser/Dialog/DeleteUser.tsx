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
import { CheckCircle, XCircle, X as XIcon } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleDelete = async () => {
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      await deleteUser(token, userId);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
            onClick={() => {
              onOpenChange(false);
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowSuccess(false)}
              aria-label="Tutup"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
              <h3 className="text-xl font-semibold text-green-700">
                Data Berhasil Dihapus
              </h3>
              <p className="text-gray-500">
                Data pengguna telah berhasil dihapus dari sistem.
              </p>
              <button
                className="mt-2 px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => {
                  setShowSuccess(false);
                  onSuccess();
                  onOpenChange(false);
                  setTimeout(() => window.location.reload(), 100);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowError(false)}
              aria-label="Tutup"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center gap-3">
              <XCircle className="w-10 h-10 text-red-600" />
              <h3 className="text-xl font-semibold text-red-600">
                Gagal Menghapus Data
              </h3>
              <p className="text-gray-500">
                Terjadi kesalahan saat menghapus data pengguna. Silakan coba
                lagi.
              </p>
              <button
                className="mt-2 px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => setShowError(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertDialog>
  );
}
