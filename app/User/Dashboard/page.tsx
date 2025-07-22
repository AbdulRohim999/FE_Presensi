"use client";

import { Navbar } from "@/app/User/components/Navbar";
import { Sidebar } from "@/app/User/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import {
  checkCampusNetwork,
  getAbsensiHariIni,
  getLaporanBulanan,
  getLaporanMingguan,
  getUserData,
} from "@/lib/api";
import { Briefcase, ChevronDown, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import AbsensiDialog from "./Dialog/AbsensiDialog";

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

interface AbsensiHariIni {
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

interface LaporanData {
  tepatWaktu: number;
  terlambat: number;
  tidakMasuk: number;
  izin: number;
  periode?: string;
}

export default function Dashboard() {
  const { token, isLoading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [viewType, setViewType] = useState<"weekly" | "monthly">("weekly");
  const [open, setOpen] = useState(false);
  const [absensiHariIni, setAbsensiHariIni] = useState<AbsensiHariIni | null>(
    null
  );
  const [isLoadingAbsensi, setIsLoadingAbsensi] = useState(false);
  const [isLoadingLaporan, setIsLoadingLaporan] = useState(false);
  const [laporanMingguan, setLaporanMingguan] = useState<LaporanData | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [laporanBulanan, setLaporanBulanan] = useState<LaporanData | null>(
    null
  );
  const [isLoadingLaporanBulanan, setIsLoadingLaporanBulanan] = useState(false);
  const [isInCampusNetwork, setIsInCampusNetwork] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();
  const currentDay = new Date().getDay();

  // Add the requested useEffect for authentication and data fetching
  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/Login");
    } else if (!isLoading && token) {
      fetchAbsensiHariIni();
      fetchLaporanMingguan();
    }
  }, [token, isLoading, router]);

  // Update waktu setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format waktu ke format 12 jam
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fungsi untuk mengecek jaringan kampus
  const checkNetwork = async () => {
    if (!token) return;

    try {
      const response = await checkCampusNetwork(token);
      setIsInCampusNetwork(response.inCampusNetwork);

      if (!response.inCampusNetwork) {
        toast.error(
          "Anda harus menggunakan jaringan kampus untuk melakukan Absensi"
        );
      }
    } catch (error) {
      console.error("Error checking network:", error);
      setIsInCampusNetwork(false);
    }
  };

  // Cek jaringan saat komponen dimount dan setiap 30 detik
  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Fungsi untuk menangani klik tombol absensi
  const handleAbsensiClick = () => {
    if (!isInCampusNetwork) {
      toast.error(
        "Anda harus menggunakan jaringan kampus untuk melakukan Absensi"
      );
      return;
    }
    setOpen(true);
  };

  // Fetch data absensi hari ini
  const fetchAbsensiHariIni = async () => {
    if (!token) return;

    setIsLoadingAbsensi(true);
    try {
      const data = await getAbsensiHariIni(token);
      setAbsensiHariIni(data);
    } catch (error) {
      console.error("Error fetching absensi hari ini:", error);
      toast.error("Gagal mengambil data absensi hari ini");
      setAbsensiHariIni(null);
    } finally {
      setIsLoadingAbsensi(false);
    }
  };

  useEffect(() => {
    fetchAbsensiHariIni();
  }, [token]);

  // Hitung progres absensi
  const hitungProgresAbsensi = () => {
    if (!absensiHariIni) return 0;

    let jumlahAbsensi = 0;
    if (absensiHariIni.absenPagi) jumlahAbsensi++;
    if (absensiHariIni.absenSiang) jumlahAbsensi++;
    if (absensiHariIni.absenSore) jumlahAbsensi++;

    // Hitung persentase berdasarkan jumlah absensi
    switch (jumlahAbsensi) {
      case 1:
        return 35;
      case 2:
        return 70;
      case 3:
        return 100;
      default:
        return 0;
    }
  };

  // Fungsi untuk mengambil data laporan mingguan
  const fetchLaporanMingguan = async () => {
    if (!token) return;

    setIsLoadingLaporan(true);
    try {
      const data = await getLaporanMingguan(
        token,
        selectedWeek,
        selectedMonth + 1,
        new Date().getFullYear()
      );
      setLaporanMingguan(data);
    } catch (error) {
      console.error("Error fetching laporan mingguan:", error);
      toast.error("Gagal mengambil data laporan mingguan");
    } finally {
      setIsLoadingLaporan(false);
    }
  };

  // Fetch data laporan mingguan saat komponen dimount atau saat minggu/bulan berubah
  useEffect(() => {
    if (viewType === "weekly") {
      fetchLaporanMingguan();
    }
  }, [token, selectedWeek, selectedMonth, viewType]);

  // Data untuk grafik mingguan
  const weeklyData = useMemo(() => {
    if (!laporanMingguan) return [];

    return [
      {
        week: laporanMingguan.periode,
        tepatWaktu: laporanMingguan.tepatWaktu,
        terlambat: laporanMingguan.terlambat,
        tidakMasuk: laporanMingguan.tidakMasuk,
        izin: laporanMingguan.izin,
      },
    ];
  }, [laporanMingguan]);

  // Fungsi untuk mengambil data laporan bulanan
  const fetchLaporanBulanan = async () => {
    if (!token) return;

    setIsLoadingLaporanBulanan(true);
    try {
      const data = await getLaporanBulanan(
        token,
        selectedMonth + 1,
        new Date().getFullYear()
      );
      setLaporanBulanan(data);
    } catch (error) {
      console.error("Error fetching laporan bulanan:", error);
      toast.error("Gagal mengambil data laporan bulanan");
    } finally {
      setIsLoadingLaporanBulanan(false);
    }
  };

  // Fetch data laporan bulanan saat komponen dimount atau saat bulan berubah
  useEffect(() => {
    if (viewType === "monthly") {
      fetchLaporanBulanan();
    }
  }, [token, selectedMonth, viewType]);

  // Data untuk grafik bulanan
  const monthlyData = useMemo(() => {
    if (!laporanBulanan) return [];

    return [
      {
        month: months[selectedMonth],
        tepatWaktu: laporanBulanan.tepatWaktu,
        terlambat: laporanBulanan.terlambat,
        tidakMasuk: laporanBulanan.tidakMasuk,
        izin: laporanBulanan.izin,
      },
    ];
  }, [laporanBulanan, selectedMonth]);

  // Data untuk perhitungan persentase
  const percentageData = useMemo(() => {
    if (!laporanBulanan) return [];

    const total =
      laporanBulanan.tepatWaktu +
      laporanBulanan.terlambat +
      laporanBulanan.tidakMasuk +
      laporanBulanan.izin;

    return [
      {
        name: "Tepat Waktu",
        value: laporanBulanan.tepatWaktu,
        percentage: Math.round((laporanBulanan.tepatWaktu / total) * 100) || 0,
        color: "#4CAF50",
      },
      {
        name: "Terlambat",
        value: laporanBulanan.terlambat,
        percentage: Math.round((laporanBulanan.terlambat / total) * 100) || 0,
        color: "#FFC107",
      },
      {
        name: "Tidak Masuk",
        value: laporanBulanan.tidakMasuk,
        percentage: Math.round((laporanBulanan.tidakMasuk / total) * 100) || 0,
        color: "#F44336",
      },
      {
        name: "Izin",
        value: laporanBulanan.izin,
        percentage: Math.round((laporanBulanan.izin / total) * 100) || 0,
        color: "#2196F3",
      },
    ];
  }, [laporanBulanan]);

  // Data untuk pie chart
  const pieChartData = useMemo(() => {
    return percentageData.map((item) => ({
      name: item.name,
      value: item.value,
    }));
  }, [percentageData]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const data = await getUserData(token);
        setUserName(`${data.firstname} ${data.lastname}`);
      } catch {
        setUserName("");
      }
    };
    fetchUser();
  }, [token]);

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F8E9" }}>
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-60">
        <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b">
          <Navbar />
        </div>
        <main className="flex-1 p-6 lg:p-8 pt-20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-2">
                  Selamat datang kembali, {userName ? userName : "User"}!
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Status Kehadiran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-bold">
                      {formatTime(currentTime)}
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className={`h-15 w-35 text-lg border-2 border-[#8BC34A] ${
                            isInCampusNetwork
                              ? "bg-[#8BC34A] hover:bg-[#7CB342]"
                              : "bg-gray-400 hover:bg-gray-500"
                          }`}
                          disabled={isLoadingAbsensi}
                          onClick={handleAbsensiClick}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {isLoadingAbsensi ? "Memuat..." : "Absensi"}
                        </Button>
                      </DialogTrigger>
                      {isInCampusNetwork && (
                        <DialogContent>
                          <AbsensiDialog />
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-4 w-4 text-green-500" />
                    Jam kerja:{" "}
                    {currentDay === 6
                      ? "08:00 AM - 14:00 PM"
                      : "08:00 AM - 17:00 PM"}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progres Absensi</span>
                      <span>{hitungProgresAbsensi()}%</span>
                    </div>
                    <Progress
                      value={hitungProgresAbsensi()}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Grafik dan Persentase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grafik Kehadiran */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex flex-col space-y-1.5">
                      <CardTitle>
                        Grafik Kehadiran{" "}
                        {viewType === "weekly" ? "Mingguan" : "Bulanan"}
                      </CardTitle>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          size="sm"
                          variant={
                            viewType === "weekly" ? "default" : "outline"
                          }
                          onClick={() => setViewType("weekly")}
                        >
                          Mingguan
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            viewType === "monthly" ? "default" : "outline"
                          }
                          onClick={() => setViewType("monthly")}
                        >
                          Bulanan
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {viewType === "weekly" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              Minggu ke-{selectedWeek}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {[1, 2, 3, 4, 5].map((week) => (
                              <DropdownMenuItem
                                key={week}
                                onClick={() => setSelectedWeek(week)}
                              >
                                Minggu ke-{week}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {months[selectedMonth]}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                  </CardHeader>
                  <CardContent>
                    {isLoadingLaporan || isLoadingLaporanBulanan ? (
                      <div className="flex justify-center items-center h-[300px]">
                        <p>Memuat data...</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={
                            viewType === "weekly" ? weeklyData : monthlyData
                          }
                        >
                          <XAxis
                            dataKey={viewType === "weekly" ? "week" : "month"}
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="tepatWaktu"
                            fill="#4CAF50"
                            name="Tepat Waktu"
                          />
                          <Bar
                            dataKey="terlambat"
                            fill="#FFC107"
                            name="Terlambat"
                          />
                          <Bar
                            dataKey="tidakMasuk"
                            fill="#F44336"
                            name="Tidak Masuk"
                          />
                          <Bar dataKey="izin" fill="#2196F3" name="Izin" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Persentase Kehadiran */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Persentase Kehadiran {months[selectedMonth]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLaporan || isLoadingLaporanBulanan ? (
                      <div className="flex justify-center items-center h-[300px]">
                        <p>Memuat data...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex justify-center">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                              >
                                {percentageData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                          {percentageData.map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span>{item.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">
                                  {item.value} hari
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  ({item.percentage}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
