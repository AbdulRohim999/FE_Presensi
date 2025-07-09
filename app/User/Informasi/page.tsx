"use client";

import { Navbar } from "@/app/User/components/Navbar";
import { Sidebar } from "@/app/User/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { getUserInformasi, InformasiAdmin } from "@/lib/api";
import { useEffect, useState } from "react";

const kategoriBadge: Record<string, { label: string; color: string }> = {
  Pengumuman: { label: "Pengumuman", color: "bg-blue-100 text-blue-700" },
  Informasi: { label: "Informasi", color: "bg-purple-100 text-purple-700" },
};

export default function InformasiPage() {
  const { token } = useAuth();
  const [informasiList, setInformasiList] = useState<InformasiAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInformasi = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const data = await getUserInformasi(token);
        setInformasiList(data);
      } catch (error) {
        console.error("Failed to fetch informasi", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInformasi();
  }, [token]);

  const today = new Date();
  const filteredList = informasiList.filter((info) => {
    const mulai = new Date(info.tanggalMulai);
    const selesai = new Date(info.tanggalSelesai);
    return today >= mulai && today <= selesai;
  });

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F8E9" }}>
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-60">
        <div className="fixed top-0 right-0 left-64 z-10 bg-white border-b">
          <Navbar />
        </div>
        <main
          className="flex-1 p-6 lg:p-8 pt-20"
          style={{ background: "#F1F8E9" }}
        >
          <div className="px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 pt-17">
              Informasi
            </h1>
            {isLoading ? (
              <div className="text-center py-10">Memuat informasi...</div>
            ) : (
              <div className="space-y-4">
                {filteredList.map((info) => {
                  const badgeDetails =
                    kategoriBadge[info.kategori] || kategoriBadge["Informasi"];
                  return (
                    <div
                      key={info.informasiId}
                      className="bg-white rounded-xl border p-6 flex flex-col gap-3 shadow-sm relative"
                    >
                      <div className="absolute top-4 right-4 z-10">
                        <Badge
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeDetails.color}`}
                        >
                          {badgeDetails.label}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold mb-1">
                          {info.judul}
                        </div>
                        <div className="text-gray-600 text-sm mb-2">
                          {info.keterangan}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-bold">
                            <span>
                              {info.createdBy
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm leading-tight">
                              {info.createdBy}
                            </div>
                            <div className="text-xs text-gray-400 -mt-0.5">
                              Pemberi Informasi
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
