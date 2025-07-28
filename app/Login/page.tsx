"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/api";
import { Eye, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  // Di dalam LoginPage component
  const router = useRouter();
  const { setToken, setUserInfo } = useAuth(); // Tambahkan setUserInfo

  // Tambahkan state untuk form data dan loading
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Tambahkan state untuk showPassword di komponen
  const [showPassword, setShowPassword] = useState(false);

  // Tambahkan handler untuk input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Di dalam handleLogin function
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi form
    if (!formData.email.trim()) {
      toast({
        title: "Email Kosong",
        description: "Silakan masukkan email Anda",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Password Kosong",
        description: "Silakan masukkan password Anda",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Format Email Salah",
        description: "Silakan masukkan format email yang benar",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData);

      // Simpan token
      setToken(response.token);

      // Simpan informasi user
      setUserInfo({
        fullName: `${response.firstname} ${response.lastname}`,
        role: response.role,
      });

      // Set flag login sukses untuk dashboard
      if (typeof window !== "undefined") {
        localStorage.setItem("loginSuccess", "true");
      }

      // Tampilkan toast sukses
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${response.firstname} ${response.lastname}!`,
        variant: "default",
      });

      // Delay 1 detik sebelum redirect agar toast terlihat
      setTimeout(() => {
        switch (response.role) {
          case "super_admin":
            router.push("/SuperAdmin/Dashboard");
            break;
          case "admin":
            router.push("/Admin/Dashboard");
            break;
          case "user":
            router.push("/User/Dashboard");
            break;
          default:
            console.error("Role tidak valid:", response.role);
            toast({
              title: "Error",
              description: "Role tidak valid",
              variant: "destructive",
            });
            return;
        }
      }, 1000);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Handle berbagai jenis error
      let errorMessage = "Terjadi kesalahan saat login";

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 401) {
          errorMessage = "Email atau password salah";
        } else if (errorResponse.response?.status === 404) {
          errorMessage = "Email tidak ditemukan";
        } else if (errorResponse.response?.status === 422) {
          errorMessage = "Data yang dimasukkan tidak valid";
        } else if (errorResponse.response?.status === 500) {
          errorMessage = "Terjadi kesalahan pada server";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/sttp-background.jpg"
        alt="Nature background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Mode Toggle */}
      <div className="absolute right-4 top-4 z-10">
        <ModeToggle />
      </div>

      {/* Login Container */}
      <div className="z-10 w-full max-w-md rounded-xl bg-white/90 p-8 shadow-lg backdrop-blur-sm dark:bg-black/70">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="relative h-32 w-32">
            <Image
              src="/STTPayakumbuh.png"
              alt="STTP Logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
              <p>Selamat Datang Di Aplikasi</p>
              <span className="inline-block">E-Presensi👋</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Silahkan Masukkan Email dan Password Anda
            </p>
          </div>

          {/* Login Form */}
          <form className="w-full space-y-4" onSubmit={handleLogin}>
            <div className="relative">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="pr-10 rounded-full"
                value={formData.email}
                onChange={handleInputChange}
              />
              <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Kata Sandi"
                className="pr-10 rounded-full"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                <Eye
                  className={`h-5 w-5 ${
                    showPassword ? "text-blue-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/Login/LupaPassword"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 ml-65"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full font-bold text-white text-lg bg-[#98ca5b] hover:bg-[#7bb23a] focus:bg-[#7bb23a] border-none"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
