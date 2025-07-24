"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";
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
import { getKehadiranHariIni, getTotalUsersByType } from "@/lib/api";
import { UserCheck, Users } from "lucide-react";
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
  status: string; // Status dari API, akan digunakan sebagai dasar untuk 'Pending'
}

export default function Dashboard() {
  const { token, isLoading } = useAuth();
  const [kehadiranData, setKehadiranData] = useState<KehadiranData[]>([]);
  const [totalDosen, setTotalDosen] = useState<number>(0);
  const [totalKaryawan, setTotalKaryawan] = useState<number>(0);
  const router = useRouter();

  // Modifikasi useEffect untuk menggunakan isLoading dari useAuth
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/Login");
    } else if (!isLoading && token) {
      fetchKehadiranHariIni();
      fetchTotalUsers();
    }
    // Cek login success
    if (typeof window !== "undefined" && localStorage.getItem("loginSuccess")) {
      toast.success("Login berhasil, selamat datang di Dashboard Admin!");
      localStorage.removeItem("loginSuccess");
    }
  }, [token, isLoading, router]);

  // Ubah semua referensi setIsLoading menjadi setIsLoadingData
  // Contoh dalam fetchKehadiranHariIni:
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
    } finally {
      // Tidak perlu lagi setIsLoadingData, cukup gunakan isLoading dari useAuth
    }
  };

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
    } catch (error) {
      console.error("Error fetching total users:", error);
      toast.error("Gagal mengambil data total user");
    }
  };

  // Function to format time
  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date format:", timeString);
        return null;
      }
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
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

  // Fungsi untuk menghitung status absensi berdasarkan aturan baru
  const calculateKehadiranStatus = (
    record: KehadiranData
  ): "Valid" | "Invalid" | "Pending" => {
    // Jika status dari backend adalah 'Menunggu', langsung return 'Pending'
    if (record.status === "Menunggu") {
      return "Pending";
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0: Minggu, 1: Senin, ..., 6: Sabtu
    const isSaturday = currentDay === 6;

    const checkTimeValid = (
      time: string | null,
      start: string,
      end: string
    ) => {
      if (!time) return false;
      const formatted = formatTime(time);
      return formatted ? isTimeWithinRange(formatted, start, end) : false;
    };

    const absenPagiDone = !!record.absenPagi;
    const absenSiangDone = !!record.absenSiang;
    const absenSoreDone = !!record.absenSore;

    const isPagiValid = checkTimeValid(record.absenPagi, "07:30", "08:15");
    const isSiangValid = checkTimeValid(record.absenSiang, "12:00", "13:30");
    const isSoreValid = checkTimeValid(record.absenSore, "16:00", "21:00");

    if (isSaturday) {
      // Untuk hari Sabtu, hanya absen pagi dan siang yang dihitung
      const nowHour = now.getHours();
      // Jika belum absen pagi atau belum absen siang dan masih sebelum jam 18:00, status pending
      if ((!absenPagiDone || !absenSiangDone) && nowHour < 18) {
        return "Pending";
      }
      // Validasi waktu absen pagi dan siang sesuai jadwal Sabtu
      const isPagiValidSabtu = checkTimeValid(
        record.absenPagi,
        "07:30",
        "08:15"
      );
      const isSiangValidSabtu = checkTimeValid(
        record.absenSiang,
        "13:00",
        "18:00"
      );
      // Jika sudah lewat jam 18:00, status langsung valid/invalid sesuai data
      if (isPagiValidSabtu && isSiangValidSabtu) {
        return "Valid";
      } else {
        return "Invalid";
      }
    } else {
      // Untuk hari selain Sabtu, status pending jika absen sore belum dilakukan dan masih sebelum jam 21:00
      const nowHour = now.getHours();
      if (
        (!absenPagiDone || !absenSiangDone || !absenSoreDone) &&
        nowHour < 21
      ) {
        return "Pending";
      }
      // Setelah jam 21:00, status langsung valid/invalid sesuai data
      if (
        absenPagiDone &&
        absenSiangDone &&
        absenSoreDone &&
        isPagiValid &&
        isSiangValid &&
        isSoreValid
      ) {
        return "Valid";
      } else {
        return "Invalid";
      }
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
            : "text-orange-500 font-medium" // Ganti 'Terlambat' menjadi orange
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
                  Selamat datang kembali, Admin!
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Memuat data...
                          </TableCell>
                        </TableRow>
                      ) : kehadiranData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Belum ada data kehadiran hari ini
                          </TableCell>
                        </TableRow>
                      ) : (
                        kehadiranData.map((record, index) => {
                          const displayStatus =
                            calculateKehadiranStatus(record);
                          return (
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
                                {renderAttendanceTime(
                                  record.absenSiang,
                                  "siang"
                                )}
                              </TableCell>
                              <TableCell>
                                {renderAttendanceTime(record.absenSore, "sore")}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={
                                    displayStatus === "Valid"
                                      ? "text-green-600 font-medium"
                                      : displayStatus === "Pending"
                                      ? "text-orange-500 font-medium"
                                      : "text-red-600 font-medium"
                                  }
                                >
                                  {displayStatus}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
                  <li>
                    Pada hari Sabtu, hanya Absen Pagi dan Absen Siang yang
                    berlaku.
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
