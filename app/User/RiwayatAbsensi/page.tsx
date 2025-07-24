"use client";

import { Navbar } from "@/app/User/components/Navbar";
import { Sidebar } from "@/app/User/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getRiwayatAbsensiByRange } from "@/lib/api";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RiwayatAbsensi {
  idAbsensi: number;
  tanggal: string;
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

// Format waktu untuk display
const formatWaktu = (timeString: string | null) => {
  if (!timeString) return "-";
  try {
    const date = new Date(timeString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "-";
  }
};

// Helper function untuk validasi waktu
const isTimeWithinRange = (
  time: string,
  startTime: string,
  endTime: string
) => {
  if (time === "-") return false;

  try {
    // Parse waktu dari string format "HH.mm"
    const [hours, minutes] = time.split(".").map(Number);
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const timeInMinutes = hours * 60 + minutes;
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  } catch (error) {
    console.error("Error validating time range:", error);
    return false;
  }
};

// Daftar bulan untuk dropdown
const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Fungsi untuk mendapatkan nama hari dalam bahasa Indonesia
const getHariIndonesia = (date: Date): string => {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hari[date.getDay()];
};

// Fungsi untuk menghitung status absensi
const calculateStatus = (record: RiwayatAbsensi) => {
  const now = new Date();
  const recordDate = new Date(record.tanggal);
  const isToday = now.toDateString() === recordDate.toDateString();
  const isSabtu = recordDate.getDay() === 6; // 6 adalah hari Sabtu

  // Jika hari ini dan belum jam 21:00, status masih pending
  if (isToday && now.getHours() < 21) {
    return "Pending";
  }

  // Hitung jumlah absen yang dilakukan
  let absenCount: number;
  if (isSabtu) {
    absenCount = [record.absenPagi, record.absenSiang].filter(
      (absen) => absen !== null
    ).length;
  } else {
    absenCount = [record.absenPagi, record.absenSiang, record.absenSore].filter(
      (absen) => absen !== null
    ).length;
  }

  // Khusus untuk hari Sabtu
  if (isSabtu) {
    // Cek apakah absen pagi dan siang valid
    const isPagiValid = isTimeWithinRange(
      formatWaktu(record.absenPagi) || "",
      "07:30:00",
      "08:15:00"
    );
    const isSiangValid = isTimeWithinRange(
      formatWaktu(record.absenSiang) || "",
      "12:00:00",
      "13:30:00"
    );

    // Jika kedua absen valid dan ada, status Valid
    if (absenCount === 2 && isPagiValid && isSiangValid) {
      return "Valid";
    }

    // Jika tidak memenuhi kriteria di atas, berarti Invalid
    return "Invalid";
  }

  // Untuk hari selain Sabtu
  // Jika tidak ada absen sama sekali atau kurang dari 3 kali
  if (absenCount === 0 || absenCount < 3) {
    return "Invalid";
  }

  // Cek apakah semua absen dalam rentang waktu yang valid
  const isPagiValid = isTimeWithinRange(
    formatWaktu(record.absenPagi) || "",
    "07:30:00",
    "08:15:00"
  );
  const isSiangValid = isTimeWithinRange(
    formatWaktu(record.absenSiang) || "",
    "12:00:00",
    "13:30:00"
  );
  const isSoreValid = isTimeWithinRange(
    formatWaktu(record.absenSore) || "",
    "16:00:00",
    "21:00:00"
  );

  // Jika semua absen valid, status Valid
  if (isPagiValid && isSiangValid && isSoreValid) {
    return "Valid";
  }

  return "Invalid";
};

export default function RiwayatAbsensi() {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [riwayatData, setRiwayatData] = useState<RiwayatAbsensi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data riwayat absensi
  const fetchRiwayatAbsensi = async () => {
    if (!token) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      let data;
      if (startDate && endDate) {
        // Jika ada filter tanggal spesifik
        data = await getRiwayatAbsensiByRange(token, {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        });
      } else if (selectedMonth !== null) {
        // Jika ada filter bulan spesifik
        const currentYear = new Date().getFullYear();
        const startOfMonth = new Date(currentYear, selectedMonth, 1);
        const endOfMonth = new Date(currentYear, selectedMonth + 1, 0);

        data = await getRiwayatAbsensiByRange(token, {
          startDate: format(startOfMonth, "yyyy-MM-dd"),
          endDate: format(endOfMonth, "yyyy-MM-dd"),
        });
      } else {
        // Jika tidak ada filter (semua bulan)
        // Mengambil data dari awal tahun sampai akhir tahun
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1); // 1 Januari
        const endOfYear = new Date(currentYear, 11, 31); // 31 Desember

        data = await getRiwayatAbsensiByRange(token, {
          startDate: format(startOfYear, "yyyy-MM-dd"),
          endDate: format(endOfYear, "yyyy-MM-dd"),
        });
      }
      setRiwayatData(data);
    } catch (error) {
      console.error("Error fetching riwayat absensi:", error);
      toast.error("Gagal mengambil data riwayat absensi");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data saat komponen dimount atau bulan berubah
  useEffect(() => {
    fetchRiwayatAbsensi();
  }, [token, selectedMonth]);

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 pt-17">
                  Riwayat Absensi
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Lihat riwayat kehadiran Anda
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Riwayat Absensi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex flex-col space-y-1.5">
                    <Label>Bulan</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[200px] justify-start"
                        >
                          {selectedMonth === null
                            ? "Semua Bulan"
                            : months[selectedMonth]}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedMonth(new Date().getMonth())
                          }
                        >
                          Semua Bulan
                        </DropdownMenuItem>
                        {months.map((month, index) => (
                          <DropdownMenuItem
                            key={month}
                            onClick={() => setSelectedMonth(index)}
                          >
                            {month}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label>Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[200px] justify-start text-left font-normal ${
                            !startDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label>Tanggal Akhir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-[200px] justify-start text-left font-normal ${
                            !endDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchRiwayatAbsensi} disabled={isLoading}>
                      {isLoading ? "Memuat..." : "Tampilkan Riwayat"}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Absen Pagi</TableHead>
                      <TableHead>Absen Siang</TableHead>
                      <TableHead>Absen Sore</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : riwayatData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Tidak ada data riwayat absensi
                        </TableCell>
                      </TableRow>
                    ) : (
                      riwayatData.map((row) => {
                        const status = calculateStatus(row);
                        const recordDate = new Date(row.tanggal);
                        const isSabtu = recordDate.getDay() === 6;

                        return (
                          <TableRow key={row.idAbsensi}>
                            <TableCell>
                              {getHariIndonesia(recordDate)},{" "}
                              {format(recordDate, "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell
                              className={
                                !isTimeWithinRange(
                                  formatWaktu(row.absenPagi) || "",
                                  "07:30:00",
                                  "08:15:00"
                                )
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {formatWaktu(row.absenPagi)}
                            </TableCell>
                            <TableCell
                              className={
                                !isTimeWithinRange(
                                  formatWaktu(row.absenSiang) || "",
                                  "12:00:00",
                                  "13:30:00"
                                )
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {formatWaktu(row.absenSiang)}
                            </TableCell>
                            <TableCell
                              className={
                                isSabtu
                                  ? "text-black font-medium"
                                  : !isTimeWithinRange(
                                      formatWaktu(row.absenSore) || "",
                                      "16:00:00",
                                      "21:00:00"
                                    )
                                  ? "text-red-600 font-medium"
                                  : ""
                              }
                            >
                              {isSabtu ? "*" : formatWaktu(row.absenSore)}
                            </TableCell>
                            <TableCell
                              className={
                                status === "Valid"
                                  ? "text-green-600 font-medium"
                                  : status === "Pending"
                                  ? "text-yellow-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {status}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
