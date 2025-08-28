"use client";

import { ModeToggle } from "@/components/mode-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getPublicInformasiAktif, InformasiAdmin, login } from "@/lib/api";
import { AlertCircle, Eye, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

  // Tambahkan state untuk error validation
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Tambahkan state untuk alert dialog
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    title: "",
    message: "",
  });

  // Tambahkan state untuk showPassword di komponen
  const [showPassword, setShowPassword] = useState(false);

  // State untuk informasi publik (running text)
  const [informasiAktif, setInformasiAktif] = useState<InformasiAdmin[]>([]);
  const [loadingInformasi, setLoadingInformasi] = useState<boolean>(false);
  const [errorInformasi, setErrorInformasi] = useState<string>("");

  // Fetch informasi aktif (publik) saat mount
  useEffect(() => {
    const fetchInformasi = async () => {
      try {
        setLoadingInformasi(true);
        const data = await getPublicInformasiAktif();
        setInformasiAktif(data || []);
      } catch (error: unknown) {
        let message = "Gagal memuat informasi";
        // Coba ambil pesan dari server jika tersedia
        if (error && typeof error === "object" && "response" in error) {
          const errObj = error as {
            response?: { status?: number; data?: { message?: string } };
            message?: string;
          };
          const status = errObj.response?.status;
          const serverMsg = errObj.response?.data?.message;
          if (status) message += ` (status ${status})`;
          if (serverMsg) message = serverMsg;
        } else if (error instanceof Error) {
          message = error.message || message;
        }
        console.error("Public informasi fetch error:", error);
        setErrorInformasi(message);
      } finally {
        setLoadingInformasi(false);
      }
    };
    fetchInformasi();
  }, []);

  // Gabungkan teks untuk ticker: "[Judul] - [Keterangan] (Dibuat oleh: [createdBy])"
  const tickerText = useMemo(() => {
    if (!informasiAktif || informasiAktif.length === 0) return "";
    const items = informasiAktif.map(
      (i) => `${i.judul} - ${i.keterangan} (Dibuat oleh: ${i.createdBy})`
    );
    return items.join("    •    ");
  }, [informasiAktif]);

  // Fungsi validasi email
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Email tidak boleh kosong";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format email tidak valid";
    }
    return "";
  };

  // Fungsi validasi password
  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "Password tidak boleh kosong";
    }
    if (password.length < 6) {
      return "Password minimal 6 karakter";
    }
    return "";
  };

  // Tambahkan handler untuk input changes dengan validasi real-time
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validasi real-time
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  // Di dalam handleLogin function
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validasi form sebelum submit
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    // Jika ada error, hentikan proses login
    if (emailError || passwordError) {
      setAlertData({
        title: "Data Tidak Valid",
        message: "Silakan perbaiki data yang dimasukkan sebelum melanjutkan.",
      });
      setShowAlert(true);
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
            setAlertData({
              title: "Error",
              message: "Role tidak valid, silakan hubungi administrator.",
            });
            setShowAlert(true);
            return;
        }
      }, 1000);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Handle berbagai jenis error dengan alert dialog
      let errorTitle = "Login Gagal";
      let errorMessage = "Terjadi kesalahan saat login";

      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        const status = errorResponse.response?.status;
        const serverMessage = errorResponse.response?.data?.message;

        switch (status) {
          case 400:
            errorTitle = "Data Tidak Valid";
            errorMessage =
              serverMessage ||
              "Email atau password yang Anda masukkan tidak valid. Silakan cek kembali.";
            break;
          case 401:
            errorTitle = "Autentikasi Gagal";
            errorMessage =
              "Email atau password yang Anda masukkan salah. Silakan cek kembali email dan password Anda.";
            break;
          case 404:
            errorTitle = "Email Tidak Ditemukan";
            errorMessage =
              "Email yang Anda masukkan tidak terdaftar dalam sistem. Silakan cek kembali atau hubungi administrator.";
            break;
          case 422:
            errorTitle = "Data Tidak Valid";
            errorMessage =
              serverMessage ||
              "Format data yang dimasukkan tidak valid. Silakan cek kembali.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorMessage =
              "Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi administrator.";
            break;
          default:
            errorTitle = "Login Gagal";
            errorMessage =
              serverMessage ||
              "Terjadi kesalahan tidak diketahui. Silakan coba lagi atau hubungi administrator.";
        }
      } else if (error instanceof Error) {
        errorTitle = "Error";
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorTitle = "Error";
        errorMessage = error;
      }

      // Tampilkan alert dialog untuk error
      setAlertData({
        title: errorTitle,
        message: errorMessage,
      });
      setShowAlert(true);

      // Juga tampilkan toast sebagai backup
      toast({
        title: errorTitle,
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

      {/* Running Text (Ticker Informasi) */}
      {(loadingInformasi || tickerText || errorInformasi) && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="w-full bg-black/60 text-white dark:bg-white/20 dark:text-white">
            <div
              className="whitespace-nowrap overflow-hidden"
              aria-live="polite"
            >
              <div
                className="inline-block px-4 py-2 animate-[marquee_18s_linear_infinite]"
                style={{
                  // Fallback jika tidak ada keyframes global
                  willChange: "transform",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                {loadingInformasi && !tickerText ? (
                  <span>Memuat informasi...</span>
                ) : errorInformasi && !tickerText ? (
                  <span>{errorInformasi}</span>
                ) : tickerText ? (
                  <span>{tickerText}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

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
                className={`pr-10 rounded-full ${
                  errors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                value={formData.email}
                onChange={handleInputChange}
              />
              <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Kata Sandi"
                className={`pr-10 rounded-full ${
                  errors.password ? "border-red-500 focus:border-red-500" : ""
                }`}
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-2">
                  {errors.password}
                </p>
              )}
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

      {/* Alert Dialog untuk Error Login */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {alertData.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {alertData.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowAlert(false)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
