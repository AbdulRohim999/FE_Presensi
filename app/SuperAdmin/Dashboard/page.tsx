"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import {
  getKehadiranHariIni,
  getSuperAdminTotalAdmins,
  getTotalUsersByType,
} from "@/lib/api";
import { UserCheck, UserCog, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Interface untuk data kehadiran
interface KehadiranData {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

export default function Dashboard() {
  const { token, isLoading } = useAuth();
  const [kehadiranData, setKehadiranData] = useState<KehadiranData[]>([]);
  const [totalDosen, setTotalDosen] = useState<number>(0);
  const [totalKaryawan, setTotalKaryawan] = useState<number>(0);
  const [totalAdmin, setTotalAdmin] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/Login");
    } else if (!isLoading && token) {
      fetchKehadiranHariIni();
      fetchTotalUsers();
    }
  }, [token, isLoading, router]); // Added router to dependencies

  // Fetch total user berdasarkan tipe
  const fetchTotalUsers = async () => {
    if (!token) {
      toast.error("Token tidak tersedia");
      return;
    }

    try {
      // Fetch total dosen
      const dataDosen = await getTotalUsersByType(token, "Dosen");
      setTotalDosen(dataDosen.total);

      // Fetch total karyawan
      const dataKaryawan = await getTotalUsersByType(token, "Karyawan");
      setTotalKaryawan(dataKaryawan.total);

      // Fetch total admin
      const dataAdmin = await getSuperAdminTotalAdmins(token);
      setTotalAdmin(dataAdmin.count);
    } catch (error) {
      console.error("Error fetching total users:", error);
      toast.error("Gagal mengambil data total user");
    }
  };

  // Fetch data kehadiran
  const fetchKehadiranHariIni = async () => {
    if (!token) {
      toast.error("Token tidak tersedia");
      return;
    }

    try {
      const data = await getKehadiranHariIni(token);
      setKehadiranData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching kehadiran:", error);
      toast.error("Gagal mengambil data kehadiran");
      setKehadiranData([]);
    }
  };

  // Fetch data saat komponen dimount
  // Di bagian awal komponen Dashboard
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Modifikasi useEffect
  useEffect(() => {
    // Tambahkan timeout kecil untuk memastikan token sudah dimuat dari localStorage
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
      if (!token) {
        router.push("/Login");
      } else {
        fetchKehadiranHariIni();
        fetchTotalUsers();
      }
      // Cek login success
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("loginSuccess")
      ) {
        toast.success(
          "Login berhasil, selamat datang di Dashboard Super Admin!"
        );
        localStorage.removeItem("loginSuccess");
      }
    }, 500); // Tunggu 500ms

    return () => clearTimeout(timer);
  }, [token]);

  // Tambahkan kondisi loading di awal render
  if (isAuthLoading) {
    return <div>Loading...</div>; // Atau komponen loading yang lebih bagus
  }

  // Function to format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    try {
      // Cek apakah string waktu sudah dalam format HH:mm:ss
      if (timeString.includes(":")) {
        // Ambil hanya jam dan menit
        const [hours, minutes] = timeString
          .split(":")
          .map((part) => part.padStart(2, "0"));
        return `${hours}:${minutes}`;
      }

      // Jika format ISO date
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date format:", timeString);
        return null;
      }

      // Konversi ke waktu lokal Indonesia
      const localDate = new Date(date.getTime() + 7 * 60 * 60 * 1000); // UTC+7

      // Format waktu ke format 24 jam
      const hours = localDate.getHours().toString().padStart(2, "0");
      const minutes = localDate.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return null;
    }
  };

  // Function to check if time is within range
  const isTimeWithinRange = (
    time: string | null,
    startTime: string,
    endTime: string
  ) => {
    if (!time) return false;
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const timeInMinutes = hours * 60 + minutes;
      const startInMinutes = startHours * 60 + startMinutes;
      const endInMinutes = endHours * 60 + endMinutes;

      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    } catch (error) {
      console.error("Error checking time range:", error);
      return false;
    }
  };

  // Function to render attendance time with appropriate color
  const renderAttendanceTime = (
    time: string | null,
    type: "pagi" | "siang" | "sore"
  ) => {
    if (!time) {
      return <span className="text-red-600 font-medium">-</span>;
    }

    const formattedTime = formatTime(time);
    if (!formattedTime) {
      console.error(`Invalid time format for ${type}:`, time);
      return <span className="text-red-600 font-medium">-</span>;
    }

    let isOnTime = false;
    switch (type) {
      case "pagi":
        isOnTime = isTimeWithinRange(formattedTime, "07:30", "08:15");
        break;
      case "siang":
        isOnTime = isTimeWithinRange(formattedTime, "12:00", "13:30");
        break;
      case "sore":
        isOnTime = isTimeWithinRange(formattedTime, "16:00", "21:00");
        break;
    }

    return (
      <span
        className={
          isOnTime
            ? "text-green-600 font-medium"
            : "text-orange-500 font-medium"
        }
      >
        {formattedTime}
      </span>
    );
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
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Selamat datang kembali, Super Admin!
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Dosen
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDosen}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Karyawan
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalKaryawan}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Admin
                  </CardTitle>
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAdmin}</div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Data Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold tracking-tight mb-4">
                Data Absensi Hari Ini
              </h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Bidang Kerja</TableHead>
                        <TableHead>Absen Pagi</TableHead>
                        <TableHead>Absen Siang</TableHead>
                        <TableHead>Absen Sore</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kehadiranData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Belum ada data kehadiran hari ini
                          </TableCell>
                        </TableRow>
                      ) : (
                        kehadiranData.map((record, index) => (
                          <TableRow key={record.idUser}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>{record.namaUser}</TableCell>
                            <TableCell>{record.bidangKerja}</TableCell>
                            <TableCell>
                              {renderAttendanceTime(record.absenPagi, "pagi")}
                            </TableCell>
                            <TableCell>
                              {renderAttendanceTime(record.absenSiang, "siang")}
                            </TableCell>
                            <TableCell>
                              {renderAttendanceTime(record.absenSore, "sore")}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  record.status === "Valid"
                                    ? "text-green-600 font-medium"
                                    : record.status === "Pending" ||
                                      record.status === "Belum Lengkap"
                                    ? "text-yellow-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {record.status === "Belum Lengkap"
                                  ? "Pending"
                                  : record.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <p>Keterangan:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>
                    Absen Pagi: 07:30-08:15 (Tepat Waktu), {">"} 08:15
                    (Terlambat)
                  </li>
                  <li>
                    Absen Siang: 12:00-13:30 (Tepat Waktu), {">"} 13:30
                    (Terlambat)
                  </li>
                  <li>
                    Absen Sore: 16:00-21:00 (Tepat Waktu), {">"} 21:00
                    (Terlambat)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
