"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { changePassword } from "@/lib/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function GantiPasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validasi password
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Error",
          description: "Semua field harus diisi",
          variant: "destructive",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Password baru dan konfirmasi password tidak cocok",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 8) {
        toast({
          title: "Error",
          description: "Password baru minimal 8 karakter",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Sesi Anda telah berakhir. Silakan login kembali.",
          variant: "destructive",
        });
        return;
      }

      const response = await changePassword(token, {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      console.log("Password change response:", response);

      toast({
        title: "Berhasil",
        description: response.message || "Password berhasil diubah",
      });

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect ke halaman profile setelah 1 detik
      setTimeout(() => {
        router.push("/SuperAdmin/Profile");
      }, 1000);
    } catch (error) {
      console.error("Error changing password:", error);

      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ErrorResponse;
        const errorMessage =
          errorData?.message ||
          (errorData?.errors &&
            Object.values(errorData.errors).flat().join(", ")) ||
          error.message ||
          "Gagal mengubah password";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengubah password",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-60">
        <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b">
          <Navbar />
        </div>
        <main className="flex-1 p-6 lg:p-8 pt-20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Ganti Password
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Ubah password akun Anda
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Form Ganti Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Password Saat Ini</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Konfirmasi Password Baru
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isLoading}
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
