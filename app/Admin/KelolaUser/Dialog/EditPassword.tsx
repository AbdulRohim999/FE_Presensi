import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { changeUserPasswordByAdmin } from "@/lib/api";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    idUser: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    photo_profile?: string;
  };
  onSubmit: (password: string) => void;
}

export function EditPasswordDialog({
  isOpen,
  onOpenChange,
  user,
  onSubmit,
}: EditPasswordDialogProps) {
  const { token } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirm(false);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const validatePassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd)
    );
  };

  const handleSubmit = async () => {
    if (!newPassword) {
      setError("Password baru tidak boleh kosong.");
      return;
    }
    if (!validatePassword(newPassword)) {
      setError("Password tidak memenuhi syarat.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setError("");
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }
    setLoading(true);
    try {
      await changeUserPasswordByAdmin(
        token,
        user.idUser,
        newPassword,
        confirmPassword
      );
      toast.success("Password berhasil diubah");
      onOpenChange(false);
      onSubmit(newPassword);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error(
          errorObj.response?.data?.message || "Gagal mengubah password"
        );
      } else {
        toast.error("Gagal mengubah password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5" />
            <AlertDialogTitle>Ubah Password User</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Ubah password untuk user yang dipilih. Password baru akan langsung
            aktif setelah disimpan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user.photo_profile || ""}
              alt={
                user.firstname ? user.firstname + " " + user.lastname : "User"
              }
            />
            <AvatarFallback>
              {user.firstname ? user.firstname.charAt(0).toUpperCase() : ""}
              {user.lastname ? user.lastname.charAt(0).toUpperCase() : ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-base">
              {user.firstname ? user.firstname : "Nama tidak tersedia"}
              {user.lastname ? " " + user.lastname : ""}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.email || "Email tidak tersedia"}
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">Password Baru</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-medium mb-1">Konfirmasi Password</label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          <div className="mb-1 font-medium">Syarat password:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Minimal 8 karakter</li>
            <li>Mengandung huruf besar dan kecil</li>
            <li>Mengandung minimal 1 angka</li>
          </ul>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNewPassword("");
              setConfirmPassword("");
            }}
            type="button"
          >
            Batal
          </Button>
          <Button
            onClick={async () => {
              await handleSubmit();
              onOpenChange(false);
            }}
            type="button"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
