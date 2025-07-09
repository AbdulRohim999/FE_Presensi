"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { login } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  XCircle,
} from "lucide-react";
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

  // Tambahkan state untuk toggle visibility password
  const [showPassword, setShowPassword] = useState(false);

  // State untuk alert notifikasi
  const [alert, setAlert] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

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
    setAlert(null);

    // Validasi: password tidak boleh kosong
    if (!formData.password) {
      setAlert({ type: "warning", message: "Password belum dimasukkan" });
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

      // Arahkan ke dashboard sesuai role
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
          setAlert({ type: "error", message: "Role tidak valid" });
          return;
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({ type: "error", message: "Email atau password salah" });
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

      {/* Alert Notifikasi */}
      {alert && (
        <div
          className={`flex items-center gap-2 mb-4 rounded border px-4 py-3 text-base font-medium fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md
            ${
              alert.type === "success"
                ? "bg-green-50 border-green-300 text-green-700"
                : ""
            }
            ${
              alert.type === "warning"
                ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                : ""
            }
            ${
              alert.type === "error"
                ? "bg-red-50 border-red-300 text-red-700"
                : ""
            }
          `}
        >
          {alert.type === "success" && (
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          )}
          {alert.type === "warning" && (
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          )}
          {alert.type === "error" && (
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
          )}
          {alert.message}
        </div>
      )}

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
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
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

      {/* Hapus Dialog error lama */}
    </div>
  );
}
