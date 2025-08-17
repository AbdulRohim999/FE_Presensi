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
import { tambahUser } from "@/lib/api";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddUserDialog() {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    tipeUser: "",
    bidangKerja: "",
    status: "Aktif",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Reset bidang kerja jika tipe user berubah
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

    // Validasi data sebelum dikirim
    if (
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.tipeUser ||
      !formData.bidangKerja
    ) {
      toast.error("Semua field harus diisi");
      return;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Format email tidak valid");
      return;
    }

    // Validasi password minimal 8 karakter
    if (formData.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    // Validasi username tidak boleh mengandung spasi atau karakter khusus
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error(
        "Username hanya boleh mengandung huruf, angka, dan underscore (_)"
      );
      return;
    }

    setIsLoading(true);

    // Trigger loading popup
    window.dispatchEvent(
      new CustomEvent("userAction", {
        detail: { action: "Menambah User", type: "start" },
      })
    );

    try {
      const userData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password,
        tipeUser: formData.tipeUser,
        bidangKerja: formData.bidangKerja,
        status: "Aktif",
      };

      console.log("Submitting user data:", userData);
      await tambahUser(token, userData);

      // Trigger success popup
      window.dispatchEvent(
        new CustomEvent("userAction", {
          detail: { action: "Menambah User", type: "success" },
        })
      );

      setOpen(false);
      // Reset form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        tipeUser: "",
        bidangKerja: "",
        status: "Aktif",
      });
    } catch (error) {
      // Trigger error popup
      window.dispatchEvent(
        new CustomEvent("userAction", {
          detail: { action: "Menambah User", type: "error" },
        })
      );

      console.error("Error adding user:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Gagal menambahkan user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Dosen/Karyawan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah User</DialogTitle>
            <DialogDescription>
              Masukkan informasi user baru di bawah ini.
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
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Username (huruf, angka, underscore)"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Minimal 8 karakter"
                required
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
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Buat User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
