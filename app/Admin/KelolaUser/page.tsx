"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getAdminUsers } from "@/lib/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Lock, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteUserDialog } from "./Dialog/DeleteUser";
import { EditPasswordDialog } from "./Dialog/EditPassword";
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
  photo_profile?: string;
  fotoProfileUrl?: string;
}

export default function KelolaUser() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [editPasswordDialogOpen, setEditPasswordDialogOpen] = useState(false);
  const [userPhotos, setUserPhotos] = useState<{ [key: number]: string }>({});

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getAdminUsers(token);
      setUsers(data);

      // Buat map foto profile dari data yang sudah ada
      const photoMap: { [key: number]: string } = {};
      data.forEach((user) => {
        if (user.photo_profile) {
          // Jika photo_profile sudah berupa URL lengkap, gunakan langsung
          if (user.photo_profile.startsWith("http")) {
            photoMap[user.idUser] = user.photo_profile;
          } else {
            // Jika hanya nama file, gabungkan dengan base URL
            photoMap[
              user.idUser
            ] = `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${user.photo_profile}`;
          }
        }
      });
      setUserPhotos(photoMap);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Listen for refresh event from AddUserDialog
  useEffect(() => {
    const handleRefreshUsers = () => {
      fetchUsers();
    };

    window.addEventListener("refreshUsers", handleRefreshUsers);
    return () => {
      window.removeEventListener("refreshUsers", handleRefreshUsers);
    };
  }, [fetchUsers]);

  // Fungsi untuk mendapatkan URL foto profile user
  const getUserPhotoUrl = (user: User) => {
    // Prioritas: userPhotos (dari state) > photo_profile (dari API) > fallback
    if (userPhotos[user.idUser]) {
      return userPhotos[user.idUser];
    }

    if (user.photo_profile) {
      if (user.photo_profile.startsWith("http")) {
        return user.photo_profile;
      } else {
        return `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${user.photo_profile}`;
      }
    }

    return ""; // Fallback ke AvatarFallback
  };

  // Fungsi untuk handle error loading foto
  const handlePhotoError = (userId: number) => {
    console.log(`Failed to load photo for user ${userId}, using fallback`);
    // Bisa ditambahkan logic untuk retry atau set default image
  };

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
                    <TableHead>Profil</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>NIDN</TableHead>
                    <TableHead>Bidang Kerja</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {searchQuery
                          ? "Tidak ada data yang sesuai dengan pencarian"
                          : "Tidak ada data pengguna"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.idUser}>
                        {/* Profil */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={getUserPhotoUrl(user)}
                                alt={user.firstname + " " + user.lastname}
                                onError={() => handlePhotoError(user.idUser)}
                              />
                              <AvatarFallback>
                                {user.firstname.charAt(0).toUpperCase()}
                                {user.lastname.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-base">
                                {user.firstname} {user.lastname}
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    user.tipeUser === "Dosen"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {user.tipeUser}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {/* Email */}
                        <TableCell>{user.email}</TableCell>
                        {/* NIDN */}
                        <TableCell>{user.nip || "-"}</TableCell>
                        {/* Bidang Kerja */}
                        <TableCell>{user.bidangKerja || "-"}</TableCell>
                        {/* Status */}
                        <TableCell>
                          {user.status === "Aktif" ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                              {user.status || "-"}
                            </span>
                          )}
                        </TableCell>
                        {/* Tanggal Dibuat*/}
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        {/* Aksi */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <span className="sr-only">Aksi</span>
                                <svg
                                  width="20"
                                  height="20"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <circle cx="10" cy="4" r="1.5" fill="#888" />
                                  <circle cx="10" cy="10" r="1.5" fill="#888" />
                                  <circle cx="10" cy="16" r="1.5" fill="#888" />
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditUserDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditPasswordDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Lock className="h-4 w-4" /> Edit Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteUserDialogOpen(true);
                                }}
                                className="gap-2 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      {selectedUser && (
        <EditUserDialog
          user={selectedUser as User}
          open={editUserDialogOpen}
          onOpenChange={(open) => {
            console.log("Dialog open:", open);
            setEditUserDialogOpen(false);
            if (!open) setSelectedUser(null);
          }}
          onSuccess={() => {
            setEditUserDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
      {selectedUser && (
        <DeleteUserDialog
          userId={selectedUser.idUser}
          userName={selectedUser.firstname + " " + selectedUser.lastname}
          open={deleteUserDialogOpen}
          onOpenChange={(open) => {
            setDeleteUserDialogOpen(open);
            if (!open) setSelectedUser(null);
          }}
          onSuccess={() => {
            setDeleteUserDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
      {selectedUser && (
        <EditPasswordDialog
          isOpen={editPasswordDialogOpen}
          onOpenChange={(open) => {
            setEditPasswordDialogOpen(open);
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser as User}
          onSubmit={() => {
            setEditPasswordDialogOpen(false);
            setSelectedUser(null);
            // TODO: Tambahkan aksi update password jika perlu
          }}
        />
      )}
    </div>
  );
}
