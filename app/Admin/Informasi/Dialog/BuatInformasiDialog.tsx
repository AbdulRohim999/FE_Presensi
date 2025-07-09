"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { createInformasi } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BuatInformasiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInformasiCreated: () => void;
}

export function BuatInformasiDialog({
  isOpen,
  onOpenChange,
  onInformasiCreated,
}: BuatInformasiDialogProps) {
  const [judul, setJudul] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [tanggalMulai, setTanggalMulai] = useState<Date>();
  const [tanggalAkhir, setTanggalAkhir] = useState<Date>();
  const [targetUser, setTargetUser] = useState<string>("semua");
  const [kategori, setKategori] = useState<string>("Informasi");
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  // Reset form ketika dialog dibuka/ditutup
  useEffect(() => {
    if (isOpen === false) {
      setJudul("");
      setKeterangan("");
      setTanggalMulai(undefined);
      setTanggalAkhir(undefined);
      setTargetUser("semua");
      setKategori("Informasi");
    }
  }, [isOpen]);

  // Debug state tanggal
  useEffect(() => {
    console.log("State tanggal mulai:", tanggalMulai);
    console.log("State tanggal akhir:", tanggalAkhir);
  }, [tanggalMulai, tanggalAkhir]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!judul.trim()) {
      toast.error("Judul informasi harus diisi");
      return;
    }

    if (!keterangan.trim()) {
      toast.error("Keterangan informasi harus diisi");
      return;
    }

    if (!tanggalMulai) {
      toast.error("Tanggal mulai harus dipilih");
      return;
    }

    if (!tanggalAkhir) {
      toast.error("Tanggal akhir harus dipilih");
      return;
    }

    if (tanggalMulai > tanggalAkhir) {
      toast.error("Tanggal akhir harus lebih besar dari tanggal mulai");
      return;
    }

    setIsLoading(true);
    try {
      // Validasi token
      if (!token) {
        toast.error("Token tidak tersedia");
        return;
      }

      // Data untuk API
      const informasiData = {
        judul: judul.trim(),
        keterangan: keterangan.trim(),
        tanggalMulai: format(tanggalMulai, "yyyy-MM-dd"),
        tanggalSelesai: format(tanggalAkhir, "yyyy-MM-dd"),
        targetTipeUser: targetUser,
        kategori: kategori,
      };

      console.log("Data informasi yang akan disimpan:", informasiData);

      // Panggil API
      await createInformasi(token, informasiData);

      toast.success("Informasi berhasil dibuat");

      // Reset form
      setJudul("");
      setKeterangan("");
      setTanggalMulai(undefined);
      setTanggalAkhir(undefined);
      setTargetUser("semua");
      setKategori("Informasi");

      // Tutup dialog dan refresh data
      onOpenChange(false);
      onInformasiCreated();
      window.location.reload();
    } catch (error) {
      console.error("Error creating informasi:", error);
      toast.error("Gagal membuat informasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form saat cancel
    setJudul("");
    setKeterangan("");
    setTanggalMulai(undefined);
    setTanggalAkhir(undefined);
    setTargetUser("semua");
    setKategori("Informasi");
    onOpenChange(false);
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-radix-popper-content-wrapper]")) {
            e.preventDefault();
          } else {
            onOpenChange(false);
            window.location.reload();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Buat Informasi Baru</DialogTitle>
          <DialogDescription>
            Buat informasi baru untuk disampaikan kepada user
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="judul" className="text-sm font-medium">
              Judul Informasi
            </Label>
            <Input
              id="judul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul informasi"
              className="border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan" className="text-sm font-medium">
              Keterangan
            </Label>
            <Textarea
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Masukkan keterangan informasi"
              className="min-h-[120px] border-slate-200 dark:border-slate-700 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori" className="text-sm font-medium">
                Kategori
              </Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Informasi">Informasi</SelectItem>
                  <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUser" className="text-sm font-medium">
                Target User
              </Label>
              <Select value={targetUser} onValueChange={setTargetUser}>
                <SelectTrigger className="border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Pilih target user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua User</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="karyawan">Karyawan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMulai" className="text-sm font-medium">
                Tanggal Mulai
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {tanggalMulai ? (
                        format(tanggalMulai, "PPP")
                      ) : (
                        <span className="text-slate-500">
                          Pilih tanggal mulai
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-50 pointer-events-auto"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={tanggalMulai}
                      onSelect={setTanggalMulai}
                      initialFocus
                      className="rounded-md border"
                      weekStartsOn={1}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                {tanggalMulai && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTanggalMulai(undefined)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalAkhir" className="text-sm font-medium">
                Tanggal Akhir
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal border-slate-200 dark:border-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                      {tanggalAkhir ? (
                        format(tanggalAkhir, "PPP")
                      ) : (
                        <span className="text-slate-500">
                          Pilih tanggal akhir
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 z-50 pointer-events-auto"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={tanggalAkhir}
                      onSelect={setTanggalAkhir}
                      initialFocus
                      className="rounded-md border"
                      weekStartsOn={1}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                {tanggalAkhir && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTanggalAkhir(undefined)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdBy" className="text-sm font-medium">
              Dibuat Oleh
            </Label>
            <Input
              id="createdBy"
              value={user ? user.fullName : "Admin"}
              disabled
              className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            />
            <p className="text-xs text-slate-500">
              Informasi ini akan dibuat oleh admin yang sedang login
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Membuat..." : "Buat Informasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
