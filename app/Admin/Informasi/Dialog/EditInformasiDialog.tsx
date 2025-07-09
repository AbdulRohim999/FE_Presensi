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
import { InformasiAdmin } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditInformasiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  informasi: InformasiAdmin | null;
  onSubmit: (data: Partial<InformasiAdmin>) => Promise<void>;
}

export function EditInformasiDialog({
  isOpen,
  onOpenChange,
  informasi,
  onSubmit,
}: EditInformasiDialogProps) {
  const [judul, setJudul] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState<Date>();
  const [tanggalSelesai, setTanggalSelesai] = useState<Date>();
  const [targetUser, setTargetUser] = useState("semua");
  const [kategori, setKategori] = useState("Informasi");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (informasi) {
      setJudul(informasi.judul);
      setKeterangan(informasi.keterangan);
      setTanggalMulai(new Date(informasi.tanggalMulai));
      setTanggalSelesai(new Date(informasi.tanggalSelesai));
      setTargetUser(informasi.targetTipeUser);
      setKategori(informasi.kategori || "Informasi");
    }
  }, [informasi, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (!tanggalSelesai) {
      toast.error("Tanggal akhir harus dipilih");
      return;
    }
    if (tanggalMulai > tanggalSelesai) {
      toast.error("Tanggal akhir harus lebih besar dari tanggal mulai");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        informasiId: informasi?.informasiId,
        judul: judul.trim(),
        keterangan: keterangan.trim(),
        tanggalMulai: format(tanggalMulai, "yyyy-MM-dd"),
        tanggalSelesai: format(tanggalSelesai, "yyyy-MM-dd"),
        targetTipeUser: targetUser,
        kategori: kategori,
      });
      toast.success("Informasi berhasil diubah");
      onOpenChange(false);
      window.location.reload();
    } catch {
      toast.error("Gagal mengubah informasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    window.location.reload();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          window.location.reload();
        }
      }}
    >
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
          <DialogTitle>Edit Informasi</DialogTitle>
          <DialogDescription>
            Ubah data informasi sesuai kebutuhan.
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
                  <PopoverContent className="w-auto p-0" align="start">
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
              <Label htmlFor="tanggalSelesai" className="text-sm font-medium">
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
                      {tanggalSelesai ? (
                        format(tanggalSelesai, "PPP")
                      ) : (
                        <span className="text-slate-500">
                          Pilih tanggal akhir
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tanggalSelesai}
                      onSelect={setTanggalSelesai}
                      initialFocus
                      className="rounded-md border"
                      weekStartsOn={1}
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
                {tanggalSelesai && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTanggalSelesai(undefined)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
