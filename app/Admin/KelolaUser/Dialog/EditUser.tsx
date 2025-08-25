"use client";

import type React from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api";
import { CheckCircle, Pencil, XCircle, X as XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  nip: string | null;
  tipeUser: string;
  status: string | null;
  bidangKerja: string | null;
  alamat: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    nip: user.nip || "",
    tipeUser: user.tipeUser,
    bidangKerja: user.bidangKerja || "",
    status: user.status || "Aktif",
    alamat: user.alamat || "",
    phoneNumber: user.phoneNumber || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "tipeUser") {
      setFormData((prev) => ({ ...prev, bidangKerja: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token tidak ditemukan");
      return;
    }
    setIsLoading(true);
    try {
      await updateUser(token, user.idUser, formData);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating user:", error);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) window.location.reload();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Perbarui informasi user di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstname" className="text-right">
                Firstname
              </Label>
              <Input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Firstname"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastname" className="text-right">
                Lastname
              </Label>
              <Input
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Lastname"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                placeholder="contoh@sttpayakumbuh.ac.id"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nip" className="text-right">
                NIP
              </Label>
              <Input
                id="nip"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nomor Induk Pegawai"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipeUser" className="text-right">
                Tipe User
              </Label>
              <Select
                value={formData.tipeUser}
                onValueChange={(value) => handleSelectChange("tipeUser", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Tipe User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dosen">Dosen</SelectItem>
                  <SelectItem value="Karyawan">Karyawan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bidangKerja" className="text-right">
                Bidang Pekerjaan
              </Label>
              <Select
                value={formData.bidangKerja}
                onValueChange={(value) =>
                  handleSelectChange("bidangKerja", value)
                }
                disabled={!formData.tipeUser}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih bidang pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipeUser === "Karyawan" ? (
                    <>
                      <SelectItem value="Bagian Akademik">
                        Bagian Akademik
                      </SelectItem>
                      <SelectItem value="Bagian Keuangan">
                        Bagian Keuangan
                      </SelectItem>
                      <SelectItem value="Bagian Kemahasiswaan">
                        Bagian Kemahasiswaan
                      </SelectItem>
                      <SelectItem value="Bagian Umum">Bagian Umum</SelectItem>
                    </>
                  ) : formData.tipeUser === "Dosen" ? (
                    <>
                      <SelectItem value="Prodi Informatika">
                        Prodi Informatika
                      </SelectItem>
                      <SelectItem value="Prodi Teknik Sipil">
                        Prodi Teknik Sipil
                      </SelectItem>
                      <SelectItem value="Prodi Teknik Komputer">
                        Prodi Teknik Komputer
                      </SelectItem>
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alamat" className="text-right">
                Alamat
              </Label>
              <Input
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                No. Telepon
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nomor telepon"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={async (e) => {
                await handleSubmit(e);
                onOpenChange(false);
              }}
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>

        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  Data Berhasil Diperbarui
                </h3>
                <p className="text-gray-500">
                  Data pengguna telah berhasil diperbarui dan disimpan ke
                  sistem.
                </p>
                <button
                  className="mt-2 px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={() => {
                    setShowSuccess(false);
                    onOpenChange(false);
                    onSuccess();
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  Gagal Memperbarui Data
                </h3>
                <p className="text-gray-500">
                  Terjadi kesalahan saat memperbarui data pengguna. Silakan coba
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
      </DialogContent>
    </Dialog>
  );
}
