"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  getAllPerizinanAdmin,
  PerizinanAdmin,
  updateStatusPerizinanAdmin,
} from "@/lib/api";
import { CheckCircle, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

export default function KelolaPerizian() {
  const { token } = useAuth();
  const [izinData, setIzinData] = useState<PerizinanAdmin[]>([]);
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [bulanFilter, setBulanFilter] = useState<string>(currentMonth);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerizinan, setSelectedPerizinan] =
    useState<PerizinanAdmin | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State untuk pop-up konfirmasi
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "setujui" | "tolak";
    perizinan: PerizinanAdmin;
  } | null>(null);

  // State untuk pop-up loading dan success
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [successData, setSuccessData] = useState({
    waktu: "",
    status: "BERHASIL",
    lokasi: "Kantor Pusat",
    tanggal: "",
    action: "",
  });

  // Fungsi untuk menampilkan loading popup
  const showLoading = () => {
    setShowLoadingPopup(true);
    setLoadingProgress(0);

    // Simulasi progress loading
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    return progressInterval;
  };

  // Fungsi untuk menampilkan success popup
  const showSuccess = (action: string) => {
    const waktuAksi = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    });

    const tanggalAksi = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    setSuccessData({
      waktu: waktuAksi,
      status: "BERHASIL",
      lokasi: "Kantor Pusat",
      tanggal: tanggalAksi,
      action: action,
    });

    setShowSuccessPopup(true);
  };

  useEffect(() => {
    const fetchIzin = async () => {
      if (!token) return;
      try {
        const data = await getAllPerizinanAdmin(token);
        setIzinData(data);
      } catch (err) {
        toast.error("Gagal mengambil data perizinan");
        console.error("Error fetching perizinan:", err);
      }
    };
    fetchIzin();
  }, [token]);

  // Filter data berdasarkan bulan
  const filteredIzin = izinData.filter((item) => {
    if (bulanFilter === "all") return true;
    const month = new Date(item.tanggalMulai).getMonth() + 1;
    return month === parseInt(bulanFilter);
  });

  // Format tanggal ke dd-mm-yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handler untuk menampilkan dialog konfirmasi
  const handleConfirmAction = (
    type: "setujui" | "tolak",
    perizinan: PerizinanAdmin
  ) => {
    setConfirmAction({ type, perizinan });
    setShowConfirmDialog(true);
  };

  // Handler untuk eksekusi aksi setelah konfirmasi
  const handleExecuteAction = async () => {
    if (!confirmAction || !token) return;

    const status = confirmAction.type === "setujui" ? "Diterima" : "Ditolak";
    const actionText =
      confirmAction.type === "setujui"
        ? "Menyetujui Pengajuan Izin"
        : "Menolak Pengajuan Izin";

    // Tutup dialog konfirmasi
    setShowConfirmDialog(false);
    setConfirmAction(null);

    // Tampilkan loading popup
    const progressInterval = showLoading();

    try {
      setIsLoading(true);
      await updateStatusPerizinanAdmin(
        confirmAction.perizinan.idPerizinan,
        status,
        token
      );

      // Update data lokal
      setIzinData((prevData) =>
        prevData.map((item) =>
          item.idPerizinan === confirmAction.perizinan.idPerizinan
            ? { ...item, status }
            : item
        )
      );

      // Selesaikan progress
      setLoadingProgress(100);
      clearInterval(progressInterval);

      // Sembunyikan loading popup dan tampilkan success popup
      setTimeout(() => {
        setShowLoadingPopup(false);
        showSuccess(actionText);
      }, 500);

      // Refresh halaman setelah 2 detik
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      // Clear progress interval jika error
      clearInterval(progressInterval);
      setShowLoadingPopup(false);
      console.error(err);
      toast.error("Gagal memproses pengajuan izin");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render lampiran badge
  const renderLampiranBadge = (lampiran?: string) => {
    if (!lampiran) {
      return (
        <Badge variant="outline" className="text-slate-500 w-28 truncate">
          Tidak ada lampiran
        </Badge>
      );
    }

    const fileExtension = lampiran.split(".").pop()?.toLowerCase();
    let icon = <FileText className="mr-1 h-3 w-3" />;
    let color = "text-blue-500";

    switch (fileExtension) {
      case "pdf":
        icon = <FileText className="mr-1 h-3 w-3" />;
        color = "text-red-500";
        break;
      case "doc":
      case "docx":
        icon = <FileText className="mr-1 h-3 w-3" />;
        color = "text-blue-500";
        break;
      case "xls":
      case "xlsx":
        icon = <FileText className="mr-1 h-3 w-3" />;
        color = "text-green-500";
        break;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        icon = <FileText className="mr-1 h-3 w-3" />;
        color = "text-purple-500";
        break;
    }

    return (
      <Button
        variant="ghost"
        className={`h-auto p-0 hover:bg-transparent ${color}`}
        onClick={() => handleOpenLampiran(lampiran)}
      >
        <Badge variant="outline" className={`${color} w-28 truncate`}>
          {icon}
          {lampiran}
        </Badge>
      </Button>
    );
  };

  const handleOpenLampiran = (lampiran: string) => {
    if (!lampiran) return;
    // Jika lampiran sudah URL lengkap (http/https), langsung buka di tab baru
    if (lampiran.startsWith("http://") || lampiran.startsWith("https://")) {
      window.open(lampiran, "_blank");
      return;
    }
    // Jika lampiran hanya nama file, gunakan endpoint backend
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${lampiran}`;
    window.open(url, "_blank");
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
                  Kelola Perizinan
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola semua pengajuan dan laporan perizinan di sini
                </p>
              </div>
            </div>

            <Tabs defaultValue="pengajuan" className="space-y-4">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger
                    value="pengajuan"
                    className="data-[state=active]:bg-[#558B2F] data-[state=active]:text-white bg-[#C5E1A5] text-[#212529]"
                  >
                    Kelola Pengajuan Izin
                  </TabsTrigger>
                  <TabsTrigger
                    value="laporan"
                    className="data-[state=active]:bg-[#558B2F] data-[state=active]:text-white bg-[#C5E1A5] text-[#212529]"
                  >
                    Laporan Izin
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="laporan" className="mt-0">
                  <div className="flex justify-end mb-2">
                    <Select value={bulanFilter} onValueChange={setBulanFilter}>
                      <SelectTrigger className="w-[180px]">
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
                  </div>
                </TabsContent>
              </div>

              <TabsContent value="pengajuan" className="space-y-4">
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Izin</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah Hari</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="w-10">Lampiran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {izinData.filter((item) => item.status === "Menunggu")
                        .length > 0 ? (
                        izinData
                          .filter((item) => item.status === "Menunggu")
                          .map((item) => (
                            <TableRow key={item.idPerizinan}>
                              <TableCell className="font-medium">
                                {item.namaUser}
                              </TableCell>
                              <TableCell>{item.jenisIzin}</TableCell>
                              <TableCell>
                                {formatDate(item.tanggalMulai)}
                                {item.tanggalMulai !== item.tanggalSelesai &&
                                  ` s/d ${formatDate(item.tanggalSelesai)}`}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const start = new Date(item.tanggalMulai);
                                  const end = new Date(item.tanggalSelesai);
                                  const diff =
                                    Math.abs(
                                      Math.ceil(
                                        (end.getTime() - start.getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      )
                                    ) + 1;
                                  return diff;
                                })()}
                              </TableCell>
                              <TableCell className="max-w-[300px]">
                                <div className="whitespace-pre-wrap">
                                  {item.keterangan || "-"}
                                </div>
                              </TableCell>
                              <TableCell>
                                {renderLampiranBadge(item.lampiran)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-sm ${
                                    item.status === "Diterima"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "Ditolak"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedPerizinan(item);
                                      setIsDetailOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleConfirmAction("setujui", item)
                                    }
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Setujui
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleConfirmAction("tolak", item)
                                    }
                                    disabled={isLoading}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Tolak
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            Belum ada pengajuan izin
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="laporan" className="space-y-4">
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Izin</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jumlah Hari</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>Lampiran</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIzin.length > 0 ? (
                        filteredIzin.map((item) => (
                          <TableRow key={item.idPerizinan}>
                            <TableCell className="font-medium">
                              {item.namaUser}
                            </TableCell>
                            <TableCell>{item.jenisIzin}</TableCell>
                            <TableCell>
                              {formatDate(item.tanggalMulai)}
                              {item.tanggalMulai !== item.tanggalSelesai &&
                                ` s/d ${formatDate(item.tanggalSelesai)}`}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const start = new Date(item.tanggalMulai);
                                const end = new Date(item.tanggalSelesai);
                                const diff =
                                  Math.abs(
                                    Math.ceil(
                                      (end.getTime() - start.getTime()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                  ) + 1;
                                return diff;
                              })()}
                            </TableCell>
                            <TableCell className="max-w-[300px]">
                              <div className="whitespace-pre-wrap">
                                {item.keterangan || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {renderLampiranBadge(item.lampiran)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-sm ${
                                  item.status === "Diterima"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Ditolak"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            Tidak ada data izin untuk bulan ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Dialog Detail Perizinan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Izin</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pengajuan izin
            </DialogDescription>
          </DialogHeader>
          {selectedPerizinan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nama</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedPerizinan.namaUser}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        selectedPerizinan.status === "Diterima"
                          ? "bg-green-100 text-green-800"
                          : selectedPerizinan.status === "Ditolak"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedPerizinan.status}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Jenis Izin</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {selectedPerizinan.jenisIzin}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Jumlah Hari</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(() => {
                      const start = new Date(selectedPerizinan.tanggalMulai);
                      const end = new Date(selectedPerizinan.tanggalSelesai);
                      const diff =
                        Math.abs(
                          Math.ceil(
                            (end.getTime() - start.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        ) + 1;
                      return diff;
                    })()}{" "}
                    hari
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tanggal Mulai</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(selectedPerizinan.tanggalMulai)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tanggal Selesai</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(selectedPerizinan.tanggalSelesai)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Keterangan</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedPerizinan.keterangan}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lampiran</Label>
                  <div className="mt-1">
                    {renderLampiranBadge(selectedPerizinan.lampiran)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Aksi</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "setujui"
                ? `Apakah Anda yakin menyetujui pengajuan izin dari "${confirmAction?.perizinan.namaUser}"?`
                : `Apakah Anda yakin menolak pengajuan izin dari "${confirmAction?.perizinan.namaUser}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmDialog(false);
                setConfirmAction(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteAction}
              disabled={isLoading}
              className={
                confirmAction?.type === "setujui"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {isLoading
                ? "Memproses..."
                : confirmAction?.type === "setujui"
                ? "Setujui"
                : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Pop-up */}
      {showLoadingPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Circular Progress */}
              <div className="relative">
                <svg className="w-20 h-20" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${loadingProgress}, 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-600">
                    {loadingProgress}%
                  </span>
                </div>
              </div>

              {/* Status Text */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Memproses {successData.action}
                </h3>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>

              {/* Sub-status Text */}
              <p className="text-sm text-gray-500">Mohon tunggu sebentar...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Pop-up */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Success Icon */}
              <div className="relative">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {successData.action} Berhasil!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Terima kasih, {successData.action.toLowerCase()} telah
                  berhasil dilakukan
                </p>
              </div>

              {/* Details Panel */}
              <div className="w-full bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Waktu:</span>
                  <span className="text-sm font-medium">
                    {successData.waktu}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                    {successData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lokasi:</span>
                  <span className="text-sm font-medium">
                    {successData.lokasi}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tanggal:</span>
                  <span className="text-sm font-medium">
                    {successData.tanggal}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setShowLoadingPopup(false);
                  // Refresh halaman setelah menutup popup
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
