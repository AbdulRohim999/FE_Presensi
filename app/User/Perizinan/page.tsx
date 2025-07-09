"use client";

import { Navbar } from "@/app/User/components/Navbar";
import { Sidebar } from "@/app/User/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { createPerizinan, getRiwayatPerizinan } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RiwayatPerizinan {
  idPerizinan: number;
  idUser: number;
  jenisIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
  namaUser: string;
  lampiran?: string;
  tanggalPengajuan?: string;
  status: string;
}

export default function Perizinan() {
  const [date, setDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [jenisIzin, setJenisIzin] = useState<string>();
  const [keterangan, setKeterangan] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [riwayatPerizinan, setRiwayatPerizinan] = useState<RiwayatPerizinan[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(true);
  const [selectedPerizinan, setSelectedPerizinan] =
    useState<RiwayatPerizinan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { token } = useAuth();

  const fetchRiwayatPerizinan = async () => {
    try {
      setIsLoadingRiwayat(true);
      if (!token) {
        console.log("Token tidak tersedia");
        return;
      }
      const data = await getRiwayatPerizinan(token);

      // Mapping: pastikan field createdAt selalu terisi
      const mappedData: RiwayatPerizinan[] = (
        data as unknown as Record<string, unknown>[]
      ).map((item) => {
        let createdAt = item["createdAt"] || item["createAt"] || "";
        if (
          (!createdAt || createdAt === "") &&
          typeof item["tanggalPengajuan"] === "string"
        ) {
          createdAt = item["tanggalPengajuan"];
        }
        return {
          ...item,
          createdAt: createdAt || "",
          status: (item["status"] as string) || "",
        } as RiwayatPerizinan;
      });

      setRiwayatPerizinan(mappedData);
    } catch (error) {
      console.error("Error fetching riwayat perizinan:", error);
      toast.error("Gagal mengambil data riwayat perizinan");
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    fetchRiwayatPerizinan();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      // Validasi tipe file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Tipe file tidak didukung. Gunakan PDF, Word, Excel, atau gambar"
        );
        return;
      }

      setSelectedFile(file);
      toast.success("File berhasil dipilih");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!token) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    if (!date || !endDate) {
      toast.error("Mohon pilih tanggal mulai dan selesai");
      return;
    }

    if (!jenisIzin) {
      toast.error("Mohon pilih jenis izin");
      return;
    }

    if (!keterangan.trim()) {
      toast.error("Mohon isi keterangan izin");
      return;
    }

    // Validasi tanggal
    if (date > endDate) {
      toast.error("Tanggal selesai harus lebih besar dari tanggal mulai");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("jenisIzin", jenisIzin);
      formData.append("tanggalMulai", format(date, "yyyy-MM-dd"));
      formData.append("tanggalSelesai", format(endDate, "yyyy-MM-dd"));
      formData.append("keterangan", keterangan.trim());

      if (selectedFile) {
        formData.append("lampiran", selectedFile);
      }

      await createPerizinan(token, formData);
      toast.success("Pengajuan izin berhasil dikirim");

      // Reset form
      setDate(undefined);
      setEndDate(undefined);
      setJenisIzin(undefined);
      setKeterangan("");
      setSelectedFile(null);

      // Refresh data riwayat
      await fetchRiwayatPerizinan();
    } catch (error) {
      console.error("Error submitting perizinan:", error);
      toast.error("Gagal mengirim pengajuan izin");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render status badge with appropriate color and icon
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Diterima":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case "Menunggu":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      case "Ditolak":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd-MM-yyyy");
  };

  // Hitung jumlah hari antara dua tanggal
  const hitungJumlahHari = (tanggalMulai: string, tanggalSelesai: string) => {
    if (!tanggalMulai || !tanggalSelesai) return 0;
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 untuk menghitung hari termasuk tanggal mulai
  };

  // Function to render lampiran badge
  const renderLampiranBadge = (lampiran?: string) => {
    if (!lampiran) {
      return (
        <Badge variant="outline" className="text-slate-500">
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
        onClick={() =>
          window.open(
            `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${lampiran}`,
            "_blank"
          )
        }
      >
        <Badge variant="outline" className={`${color} w-28 truncate`}>
          {icon}
          {lampiran}
        </Badge>
      </Button>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 pt-17">
                  Perizinan
                </h1>
              </div>
            </div>

            <Tabs defaultValue="ajukan" className="space-y-6">
              <TabsList className="grid w-full md:w-auto grid-cols-2">
                <TabsTrigger
                  value="ajukan"
                  className="data-[state=active]:bg-[#558B2F] data-[state=active]:text-white bg-[#C5E1A5] text-[#212529]"
                >
                  Ajukan Izin
                </TabsTrigger>
                <TabsTrigger
                  value="riwayat"
                  className="data-[state=active]:bg-[#558B2F] data-[state=active]:text-white bg-[#C5E1A5] text-[#212529]"
                >
                  Riwayat Perizinan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ajukan" className="space-y-4">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Form Pengajuan Izin
                    </CardTitle>
                    <CardDescription>
                      Isi formulir berikut untuk mengajukan izin baru
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="jenis"
                            className="text-sm font-medium"
                          >
                            Jenis Izin
                          </Label>
                          <Select
                            value={jenisIzin}
                            onValueChange={setJenisIzin}
                          >
                            <SelectTrigger
                              id="jenis"
                              className="border-slate-200 dark:border-slate-700"
                            >
                              <SelectValue placeholder="Pilih jenis izin" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="sakit">Sakit</SelectItem>
                              <SelectItem value="cuti">Cuti</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="tanggal"
                            className="text-sm font-medium"
                          >
                            Tanggal
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                  {date ? (
                                    format(date, "PPP")
                                  ) : (
                                    <span className="text-slate-500">
                                      Tanggal mulai
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  initialFocus
                                  className="rounded-md border"
                                  weekStartsOn={1}
                                  locale={id}
                                />
                              </PopoverContent>
                            </Popover>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                  {endDate ? (
                                    format(endDate, "PPP")
                                  ) : (
                                    <span className="text-slate-500">
                                      Tanggal selesai
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                  className="rounded-md border"
                                  weekStartsOn={1}
                                  locale={id}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="keterangan"
                          className="text-sm font-medium"
                        >
                          Keterangan
                        </Label>
                        <Textarea
                          id="keterangan"
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          placeholder="Berikan keterangan izin secara detail"
                          className="min-h-[120px] border-slate-200 dark:border-slate-700 resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file" className="text-sm font-medium">
                          Lampiran
                        </Label>
                        <div className="flex items-center gap-4 w-115 ">
                          <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("file")?.click()
                            }
                            className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                          >
                            <Upload className="mr-2 h-4 w-4 text-slate-500" />
                            {selectedFile ? selectedFile.name : "Pilih file"}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-500">
                          Format yang didukung: PDF, Word, Excel, JPG, PNG, GIF
                          (Maks. 5MB)
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="px-6"
                          disabled={isLoading}
                        >
                          {isLoading ? "Mengirim..." : "Ajukan Izin"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="riwayat">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Riwayat Perizinan
                    </CardTitle>
                    <CardDescription>
                      Daftar riwayat pengajuan izin dan statusnya
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {isLoadingRiwayat ? (
                        <div className="p-4 text-center">Memuat data...</div>
                      ) : riwayatPerizinan.length === 0 ? (
                        <div className="p-4 text-center">
                          Tidak ada data riwayat perizinan
                        </div>
                      ) : (
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-800">
                            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800">
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Tanggal Pengajuan
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Tanggal Izin
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Jumlah Hari
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Jenis Izin
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 w-[25%] text-center">
                                Keterangan
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center w-32">
                                Lampiran
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Status
                              </TableHead>
                              <TableHead className="font-medium py-3 px-4 text-center">
                                Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {riwayatPerizinan.map((row) => (
                              <TableRow
                                key={row.idPerizinan}
                                className="hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
                              >
                                <TableCell className="font-medium py-3 px-4 text-center">
                                  {formatDate(row.createdAt)}
                                </TableCell>
                                <TableCell className="font-medium py-3 px-4 text-center">
                                  {formatDate(row.tanggalMulai)} -{" "}
                                  {formatDate(row.tanggalSelesai)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-center">
                                  {hitungJumlahHari(
                                    row.tanggalMulai,
                                    row.tanggalSelesai
                                  )}{" "}
                                  hari
                                </TableCell>
                                <TableCell className="capitalize py-3 px-4 text-center">
                                  {row.jenisIzin}
                                </TableCell>
                                <TableCell className="py-3 px-4 w-[25%] text-center">
                                  {row.keterangan}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-center w-32 max-w-xs truncate">
                                  {renderLampiranBadge(row.lampiran)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-center">
                                  {renderStatusBadge(row.status)}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPerizinan(row);
                                      setIsDetailOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Dialog Detail Perizinan */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan Izin</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pengajuan izin
            </DialogDescription>
          </DialogHeader>
          {selectedPerizinan && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">
                    Tanggal Pengajuan
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(selectedPerizinan.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedPerizinan.status)}
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
                    {hitungJumlahHari(
                      selectedPerizinan.tanggalMulai,
                      selectedPerizinan.tanggalSelesai
                    )}{" "}
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
    </div>
  );
}
