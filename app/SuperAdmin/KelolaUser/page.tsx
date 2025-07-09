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
import { getDaftarPengguna } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteUserDialog } from "./Dialog/DeleteUser";
import { EditUserDialog } from "./Dialog/EditUser";
import { AddUserDialog } from "./Dialog/TambahUser";

interface User {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  nip: string | null;
  tipeUser: string;
  status: string | null;
  bidangKerja: string | null;
  alamat: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export default function KelolaUser() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getDaftarPengguna(token);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: id });
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.tipeUser.toLowerCase().includes(searchLower) ||
      (user.bidangKerja && user.bidangKerja.toLowerCase().includes(searchLower))
    );
  });

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
            <div className="flex justify-between items-center mb-6 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Data Dosen dan Karyawan
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola data dosen dan karyawan STT Payakumbuh
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama, email, tipe user, bidang kerja..."
                    className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <AddUserDialog />
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead>Tipe User</TableHead>
                    <TableHead>Bidang Kerja</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        {searchQuery
                          ? "Tidak ada data yang sesuai dengan pencarian"
                          : "Tidak ada data pengguna"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.idUser}>
                        <TableCell className="font-medium">
                          {user.firstname} {user.lastname}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.nip || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              user.tipeUser === "Dosen"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.tipeUser}
                          </span>
                        </TableCell>
                        <TableCell>{user.bidangKerja || "-"}</TableCell>
                        <TableCell>{user.status || "-"}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <EditUserDialog
                              user={user}
                              onSuccess={fetchUsers}
                            />
                            <DeleteUserDialog
                              userId={user.idUser}
                              userName={`${user.firstname} ${user.lastname}`}
                              onSuccess={fetchUsers}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
