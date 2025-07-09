"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getSuperAdminAdmins } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteAdminDialog } from "./Dialog/DeleteAdmin";
import { EditAdminDialog } from "./Dialog/EditAdmin";
import { AddAdminDialog } from "./Dialog/TambahAdmin";

interface Admin {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string | null;
  nip: string | null;
  tipeUser: string | null;
  bidangKerja: string | null;
  alamat: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

export default function StaffManagement() {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdmins = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getSuperAdminAdmins(token);
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Gagal mengambil data admin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

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
            <div className="flex justify-between items-center mb-6 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Data Admin
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola data admin STT Payakumbuh
                </p>
              </div>
              <AddAdminDialog onSuccess={fetchAdmins} />
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : admins.length > 0 ? (
                    admins.map((admin) => (
                      <TableRow key={admin.idUser}>
                        <TableCell className="font-medium">
                          {admin.firstname} {admin.lastname}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              admin.status === "Aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {admin.status || "Nonaktif"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(admin.createdAt), "dd MMMM yyyy", {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-2 justify-end">
                            <EditAdminDialog
                              admin={admin}
                              onSuccess={fetchAdmins}
                            />
                            <DeleteAdminDialog
                              admin={admin}
                              onSuccess={fetchAdmins}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Tidak ada data admin
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
