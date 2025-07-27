"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getKehadiranUser } from "@/lib/api";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, Download, FilterX } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface KehadiranUser {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  tanggalAbsensi: string;
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

// Helper functions (Dipindahkan ke sini agar dapat diakses oleh checkAndUpdateStatus)
// Format time (jam:menit)
const formatTime = (timeString: string | null) => {
  if (!timeString) return "-";
  try {
    // Jika ada titik, ambil sebelum titik (hilangkan milidetik/mikrodetik)
    const mainTime = timeString.split(".")[0];
    const parts = mainTime.split(":").map((part) => part.padStart(2, "0"));
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}`;
    } else if (parts.length === 2) {
      return `${parts[0]}:${parts[1]}:00`;
    }
    // Jika format Date ISO
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "-";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return "-";
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
    // Format waktu untuk perbandingan
    let formattedTime = time;
    if (time.includes("T")) {
      // Jika format ISO, ambil bagian waktu saja
      const date = new Date(time);
      if (isNaN(date.getTime())) return false;
      formattedTime = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else if (time.includes(".")) {
      // Jika ada milidetik, ambil sebelum titik
      formattedTime = time.split(".")[0];
    }

    const [hours, minutes] = formattedTime.split(":").map(Number);
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

// Fungsi untuk mendapatkan nama hari dalam bahasa Indonesia
const getHariIndonesia = (date: Date): string => {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hari[date.getDay()];
};

export default function UserAttendanceReport({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { token } = useAuth();
  const userId = parseInt(id);
  const [date, setDate] = useState<DateRange | undefined>();
  const [kehadiranData, setKehadiranData] = useState<KehadiranUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    namaUser: string;
    bidangKerja: string;
  } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fungsi untuk mengecek dan mengubah status berdasarkan logika baru
  const checkAndUpdateStatus = (record: KehadiranUser) => {
    const today = new Date();
    const recordDate = new Date(record.tanggalAbsensi);
    const isToday = recordDate.toDateString() === today.toDateString();
    const isSaturday = recordDate.getDay() === 6; // 6 adalah hari Sabtu

    // Jika status dari backend adalah "Izin", itu yang utama
    if (record.status === "Izin") {
      return "Izin";
    }

    // Cek untuk status "Pending" (jika hari ini dan belum lewat waktu absen akhir, serta belum lengkap)
    const absenPagiDone = !!record.absenPagi;
    const absenSiangDone = !!record.absenSiang;
    const absenSoreDone = !!record.absenSore;

    if (isToday) {
      // Waktu akhir absen untuk hari ini, tergantung hari Sabtu atau tidak
      const lastAbsenHour = isSaturday ? 18 : 21; // 18:00 untuk Sabtu, 21:00 untuk hari biasa
      const lastAbsenMinute = 0;

      if (
        today.getHours() < lastAbsenHour ||
        (today.getHours() === lastAbsenHour &&
          today.getMinutes() < lastAbsenMinute)
      ) {
        if (isSaturday) {
          // Untuk Sabtu: absen pagi & siang
          if (!absenPagiDone || !absenSiangDone) {
            return "Pending";
          }
        } else {
          // Hari biasa: absen pagi, siang, sore
          if (!absenPagiDone || !absenSiangDone || !absenSoreDone) {
            return "Pending";
          }
        }
      }
    }

    // Tentukan status berdasarkan kelengkapan dan validitas absen
    const isPagiValid = isTimeWithinRange(record.absenPagi, "07:30", "08:15");
    const isSiangValid = isTimeWithinRange(record.absenSiang, "12:00", "13:30");
    const isSoreValid = isTimeWithinRange(record.absenSore, "16:00", "21:00");

    if (isSaturday) {
      // Untuk Sabtu, validasi waktu siang berbeda
      const isSiangValidSabtu = isTimeWithinRange(
        record.absenSiang,
        "13:00",
        "18:00"
      );

      if (absenPagiDone && absenSiangDone && isPagiValid && isSiangValidSabtu) {
        return "Valid";
      } else {
        return "Invalid";
      }
    } else {
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

  const fetchKehadiranData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getKehadiranUser(token, userId);
      if (!data || data.length === 0) {
        setError("Tidak ada data kehadiran untuk user ini");
        setKehadiranData([]);
        setUserInfo(null);
        return;
      }
      // Mapping data dan update status jika perlu
      const validData: KehadiranUser[] = data.map((record: KehadiranUser) => ({
        idUser: record.idUser,
        namaUser: record.namaUser,
        bidangKerja: record.bidangKerja,
        tanggalAbsensi: record.tanggalAbsensi,
        absenPagi: record.absenPagi,
        absenSiang: record.absenSiang,
        absenSore: record.absenSore,
        status: checkAndUpdateStatus(record), // Menggunakan fungsi baru untuk status
      }));
      setKehadiranData(validData);
      if (validData.length > 0) {
        setUserInfo({
          namaUser: validData[0].namaUser,
          bidangKerja: validData[0].bidangKerja,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Gagal mengambil data kehadiran");
      setKehadiranData([]);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update status setiap menit (tetap menggunakan checkAndUpdateStatus)
  useEffect(() => {
    const interval = setInterval(() => {
      setKehadiranData((prevData) =>
        prevData.map((record) => ({
          ...record,
          status: checkAndUpdateStatus(record),
        }))
      );
    }, 60000); // Check setiap 1 menit

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchKehadiranData();
  }, [token, userId]);

  // Filter attendance data based on selected date range & bulan
  const filteredAttendance = kehadiranData.filter((record) => {
    // Filter bulan
    if (selectedMonth !== "all") {
      const month = new Date(record.tanggalAbsensi).getMonth() + 1;
      if (month !== parseInt(selectedMonth)) return false;
    }

    // Filter status
    if (selectedStatus !== "all") {
      if (record.status !== selectedStatus) return false; // record.status sudah hasil dari checkAndUpdateStatus
    }

    // Filter tanggal range
    if (!date?.from) return true;
    try {
      const recordDate = new Date(record.tanggalAbsensi);
      const fromDate = new Date(date.from!);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = date.to ? new Date(date.to) : new Date(date.from!);
      toDate.setHours(23, 59, 59, 999);
      return recordDate >= fromDate && recordDate <= toDate;
    } catch (error) {
      console.error("Error filtering date:", error);
      return false;
    }
  });

  // Format date to DD/MM/YYYY with day
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${getHariIndonesia(date)}, ${day}/${month}/${year}`;
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDate(undefined);
  };

  const handleDownloadPDF = () => {
    try {
      if (!userInfo) return toast.error("Data user tidak ditemukan");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("LAPORAN KEHADIRAN USER", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Nama: ${userInfo.namaUser}`, 20, 35);
      doc.text(`Bidang Kerja: ${userInfo.bidangKerja}`, 20, 43);
      // Table
      const tableData = filteredAttendance.map((item, idx) => [
        idx + 1,
        formatDate(item.tanggalAbsensi),
        item.absenPagi ? formatTime(item.absenPagi) : "-",
        item.absenSiang ? formatTime(item.absenSiang) : "-",
        (() => {
          const date = new Date(item.tanggalAbsensi);
          const isSaturday = date.getDay() === 6;
          if (isSaturday) return "*";
          return item.absenSore ? formatTime(item.absenSore) : "-";
        })(),
        item.status,
      ]);
      autoTable(doc, {
        head: [
          [
            "No",
            "Tanggal",
            "Absen Pagi",
            "Absen Siang",
            "Absen Sore",
            "Status",
          ],
        ],
        body: tableData,
        startY: 50,
      });
      doc.save(`Laporan_User_${userInfo.namaUser}.pdf`);
      toast.success("Laporan PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh PDF");
    }
  };

  const handleDownloadExcel = () => {
    try {
      if (!userInfo) return toast.error("Data user tidak ditemukan");
      const excelData = filteredAttendance.map((item, idx) => ({
        No: idx + 1,
        Tanggal: formatDate(item.tanggalAbsensi),
        "Absen Pagi": item.absenPagi ? formatTime(item.absenPagi) : "-",
        "Absen Siang": item.absenSiang ? formatTime(item.absenSiang) : "-",
        "Absen Sore": (() => {
          const date = new Date(item.tanggalAbsensi);
          const isSaturday = date.getDay() === 6;
          if (isSaturday) return "*";
          return item.absenSore ? formatTime(item.absenSore) : "-";
        })(),
        Status: item.status,
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Laporan User");
      XLSX.writeFile(wb, `Laporan_User_${userInfo.namaUser}.xlsx`);
      toast.success("Laporan Excel berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh Excel");
    }
  };

  const handleDownloadWord = async () => {
    try {
      if (!userInfo) return toast.error("Data user tidak ditemukan");
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "LAPORAN KEHADIRAN USER",
                    bold: true,
                    size: 32,
                  }),
                ],
              }),
              new Paragraph({ text: `Nama: ${userInfo.namaUser}` }),
              new Paragraph({ text: `Bidang Kerja: ${userInfo.bidangKerja}` }),
              new Paragraph({ text: "" }),
              ...filteredAttendance.map(
                (item, idx) =>
                  new Paragraph({
                    children: [
                      new TextRun(
                        `${idx + 1}. ${formatDate(
                          item.tanggalAbsensi
                        )} | Pagi: ${
                          item.absenPagi ? formatTime(item.absenPagi) : "-"
                        } | Siang: ${
                          item.absenSiang ? formatTime(item.absenSiang) : "-"
                        } | Sore: ${(() => {
                          const date = new Date(item.tanggalAbsensi);
                          const isSaturday = date.getDay() === 6;
                          if (isSaturday) return "*";
                          return item.absenSore
                            ? formatTime(item.absenSore)
                            : "-";
                        })()} | Status: ${item.status}`
                      ),
                    ],
                  })
              ),
            ],
          },
        ],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_User_${userInfo.namaUser}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Laporan Word berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh Word");
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F8E9" }}>
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64">
        <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b">
          <Navbar />
        </div>
        <main className="flex-1 p-6 lg:p-8 pt-20">
          <div className="container mx-auto max-w-6xl">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Laporan Kehadiran - {userInfo?.namaUser || "Loading..."}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Departemen {userInfo?.bidangKerja || "Loading..."}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Unduh Laporan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh sebagai PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh sebagai Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadWord}>
                    <Download className="h-4 w-4 mr-2" />
                    Unduh sebagai Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    {/* Filter Bulan */}
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter Bulan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Bulan</SelectItem>
                        <SelectItem value="1">Januari</SelectItem>
                        <SelectItem value="2">Februari</SelectItem>
                        <SelectItem value="3">Maret</SelectItem>
                        <SelectItem value="4">April</SelectItem>
                        <SelectItem value="5">Mei</SelectItem>
                        <SelectItem value="6">Juni</SelectItem>
                        <SelectItem value="7">Juli</SelectItem>
                        <SelectItem value="8">Agustus</SelectItem>
                        <SelectItem value="9">September</SelectItem>
                        <SelectItem value="10">Oktober</SelectItem>
                        <SelectItem value="11">November</SelectItem>
                        <SelectItem value="12">Desember</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Filter Status */}
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Invalid">Invalid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Izin">Izin</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Date Range Picker */}
                    <DatePickerWithRange date={date} setDate={setDate} />
                    {date && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateFilter}
                        className="h-9"
                      >
                        <FilterX className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredAttendance.length} entri
                  </div>
                </div>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Tanggal</TableHead>
                        <TableHead className="text-center">
                          Absen Pagi
                        </TableHead>
                        <TableHead className="text-center">
                          Absen Siang
                        </TableHead>
                        <TableHead className="text-center">
                          Absen Sore
                        </TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            Memuat data...
                          </TableCell>
                        </TableRow>
                      ) : filteredAttendance.length > 0 ? (
                        filteredAttendance.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {formatDate(record.tanggalAbsensi)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatTime(record.absenPagi)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatTime(record.absenSiang)}
                            </TableCell>
                            <TableCell className="text-center">
                              {(() => {
                                const date = new Date(record.tanggalAbsensi);
                                const isSaturday = date.getDay() === 6;
                                if (isSaturday) return "*";
                                return formatTime(record.absenSore);
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${
                                  record.status === "Valid"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : record.status === "Izin"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {record.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            Tidak ada data untuk rentang tanggal yang dipilih
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
