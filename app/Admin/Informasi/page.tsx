"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";
import { BuatInformasiDialog } from "@/app/Admin/Informasi/Dialog/BuatInformasiDialog";
import { EditInformasiDialog } from "@/app/Admin/Informasi/Dialog/EditInformasiDialog";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/context/AuthContext";
import {
  deleteInformasi,
  getAllInformasi,
  InformasiAdmin,
  updateInformasi,
} from "@/lib/api";
import { format } from "date-fns";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Informasi() {
  const [informasiList, setInformasiList] = useState<InformasiAdmin[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editInformasi, setEditInformasi] = useState<InformasiAdmin | null>(
    null
  );
  const [bulanFilter, setBulanFilter] = useState<string>("all");
  const { token } = useAuth();

  const fetchInformasi = useCallback(async () => {
    if (!token) {
      setIsLoadingList(false);
      return;
    }

    setIsLoadingList(true);
    try {
      const data = await getAllInformasi(token);
      setInformasiList(data);
    } catch (error) {
      console.error("Error fetching informasi:", error);
      toast.error("Gagal mengambil data informasi");
    } finally {
      setIsLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInformasi();
  }, [fetchInformasi]);

  const handleInformasiCreated = useCallback(() => {
    fetchInformasi();
  }, [fetchInformasi]);

  const handleDelete = useCallback(
    async (informasiId: number) => {
      if (!confirm("Apakah Anda yakin ingin menghapus informasi ini?")) {
        return;
      }

      if (!token) {
        toast.error("Token tidak tersedia");
        return;
      }

      try {
        await deleteInformasi(token, informasiId);
        setInformasiList((prev) =>
          prev.filter((info) => info.informasiId !== informasiId)
        );
        toast.success("Informasi berhasil dihapus");
      } catch (error) {
        console.error("Error deleting informasi:", error);
        toast.error("Gagal menghapus informasi");
      }
    },
    [token]
  );

  const handleEdit = useCallback((info: InformasiAdmin) => {
    setEditInformasi(info);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: Partial<InformasiAdmin>) => {
      if (!token || !data.informasiId) return;
      try {
        const updatedInfo = await updateInformasi(
          token,
          data.informasiId,
          data
        );
        setInformasiList((prev) =>
          prev.map((info) =>
            info.informasiId === data.informasiId ? updatedInfo : info
          )
        );
        toast.success("Informasi berhasil diubah");
      } catch {
        toast.error("Gagal mengubah informasi");
      }
    },
    [token]
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd MMMM yyyy");
  };

  const getStatusBadge = (tanggalMulai: string, tanggalSelesai: string) => {
    const today = new Date();
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    if (today < startDate) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
          Akan Datang
        </Badge>
      );
    } else if (today >= startDate && today <= endDate) {
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          Aktif
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 border border-gray-200">
          Berakhir
        </Badge>
      );
    }
  };

  const getTargetUserLabel = (targetTipeUser: string) => {
    switch (targetTipeUser) {
      case "semua":
        return "Semua Pengguna";
      case "dosen":
        return "Dosen";
      case "karyawan":
        return "Karyawan";
      default:
        return targetTipeUser;
    }
  };

  // Filter bulan
  const filteredInformasiList = informasiList.filter((info) => {
    if (bulanFilter === "all") return true;
    const bulan = new Date(info.createdAt).getMonth() + 1;
    return bulan === parseInt(bulanFilter);
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F8E9" }}>
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Informasi
                </h1>
                <p className="text-gray-500 mt-1">
                  Kelola informasi untuk disampaikan kepada seluruh pengguna.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={bulanFilter} onValueChange={setBulanFilter}>
                  <SelectTrigger className="w-[160px]">
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
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Buat Informasi
                </Button>
              </div>
            </div>

            {isLoadingList ? (
              <div className="text-center py-10">Memuat data...</div>
            ) : filteredInformasiList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada informasi yang dibuat.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredInformasiList.map((info) => (
                  <div
                    key={info.informasiId}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800">
                          {info.judul}
                        </h2>
                        <p className="text-gray-500 mt-1">{info.keterangan}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <Badge
                          className={`text-sm ${
                            info.kategori === "Pengumuman"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {info.kategori}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(info)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(info.informasiId)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="border-t my-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Periode</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(info.tanggalMulai)} -{" "}
                              {formatDate(info.tanggalSelesai)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Target User</p>
                            <p className="text-sm font-medium text-gray-700">
                              {getTargetUserLabel(info.targetTipeUser)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Dibuat</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(info.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(info.tanggalMulai, info.tanggalSelesai)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <BuatInformasiDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onInformasiCreated={handleInformasiCreated}
      />
      <EditInformasiDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        informasi={editInformasi}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
