"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
import { DatePickerWithRange } from "@/components/date-range-picker";
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
import { getJumlahStatusKehadiranPeriode } from "@/lib/api";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

interface User {
  idUser: number;
  namaUser: string;
  tipeUser: string | null;
  role: string;
  bidangKerja: string | null;
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

export default function AttendanceReport() {
  const router = useRouter();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tipeUserFilter, setTipeUserFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );

  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (month: string) => {
    const months = {
      "1": "Januari",
      "2": "Februari",
      "3": "Maret",
      "4": "April",
      "5": "Mei",
      "6": "Juni",
      "7": "Juli",
      "8": "Agustus",
      "9": "September",
      "10": "Oktober",
      "11": "November",
      "12": "Desember",
    };
    return months[month as keyof typeof months] || "";
  };

  // Fungsi untuk mendapatkan deskripsi berdasarkan filter
  const getDescription = () => {
    const description = "Laporan kehadiran dosen dan karyawan STT Payakumbuh";
    let filterDescription = "";

    if (date?.from) {
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = getMonthName((date.getMonth() + 1).toString());
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const startDate = formatDate(date.from);
      const endDate = date.to ? formatDate(date.to) : startDate;
      filterDescription = `pada ${startDate} hingga ${endDate}`;
    } else if (selectedMonth !== "all") {
      filterDescription = `Bulan ${getMonthName(selectedMonth)}`;
    }

    return (
      <>
        {description}
        {filterDescription && <br />}
        {filterDescription}
      </>
    );
  };

  // Fungsi untuk mendapatkan tanggal awal dan akhir bulan
  const getMonthRange = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      let data;

      if (date?.from) {
        const params = {
          startDate: date.from.toISOString().split("T")[0],
          endDate: date.to
            ? date.to.toISOString().split("T")[0]
            : date.from.toISOString().split("T")[0],
        };
        data = await getJumlahStatusKehadiranPeriode(token, params);
      } else if (selectedMonth !== "all") {
        const currentYear = new Date().getFullYear();
        const { startDate, endDate } = getMonthRange(
          parseInt(selectedMonth),
          currentYear
        );
        data = await getJumlahStatusKehadiranPeriode(token, {
          startDate,
          endDate,
        });
      } else {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = new Date().toISOString().split("T")[0];
        data = await getJumlahStatusKehadiranPeriode(token, {
          startDate,
          endDate,
        });
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Data yang diterima bukan array:", data);
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, date, selectedMonth]);

  // Filter data based on search query and tipe user
  const filteredData = users.filter((record) => {
    const fullName = record.namaUser.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesTipeUser =
      tipeUserFilter === "all" || record.tipeUser === tipeUserFilter;
    return matchesSearch && matchesTipeUser;
  });

  const handleUserClick = (userId: number) => {
    router.push(`/SuperAdmin/LaporanKehadiran/LaporanUser/${userId}`);
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
            <div className="flex justify-between items-start mb-6 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Laporan Kehadiran
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {getDescription()}
                </p>
              </div>

              {/* Filter Bar */}
              <div className="space-y-4">
                {/* Filter Bar Atas */}
                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Tipe User Filter */}
                  <Select
                    value={tipeUserFilter}
                    onValueChange={setTipeUserFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter Tipe User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe User</SelectItem>
                      <SelectItem value="Dosen">Dosen</SelectItem>
                      <SelectItem value="Karyawan">Karyawan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Bar Bawah */}
                <div className="flex items-center gap-2">
                  {/* Filter Bulan */}
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => {
                      setSelectedMonth(value);
                      setDate(undefined); // Reset date range ketika bulan dipilih
                    }}
                  >
                    <SelectTrigger className="w-[196px]">
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

                  {/* Date Range Picker */}
                  <div className="flex items-center gap-2">
                    <DatePickerWithRange
                      date={date}
                      setDate={(newDate) => {
                        setDate(newDate);
                        setSelectedMonth("all"); // Reset bulan ketika date range dipilih
                      }}
                    />
                    {date?.from && (
                      <button
                        onClick={() => setDate(undefined)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Reset periode"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Tipe User</TableHead>
                    <TableHead>Bidang Kerja</TableHead>
                    <TableHead className="text-center">Valid</TableHead>
                    <TableHead className="text-center">Invalid</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <TableRow
                        key={record.idUser}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => handleUserClick(record.idUser)}
                      >
                        <TableCell className="font-medium">
                          {record.namaUser}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              record.tipeUser === "Dosen"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.tipeUser || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">
                            {record.bidangKerja || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">
                            {record.validCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600 font-medium">
                            {record.invalidCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {record.totalCount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Tidak ada data yang sesuai dengan pencarian
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
