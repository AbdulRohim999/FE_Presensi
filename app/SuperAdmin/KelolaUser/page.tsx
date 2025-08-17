"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
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
import { CheckCircle, Lock, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DeleteUserDialog } from "./Dialog/DeleteUser";
import { EditPasswordDialog } from "./Dialog/EditPassword";
import { EditUserDialog } from "./Dialog/EditUser";
import { AddUserDialog } from "./Dialog/TambahUser";

// Extend Window interface to include custom property
declare global {
  interface Window {
    currentProgressInterval?: NodeJS.Timeout;
  }
}

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
  fotoProfile?: string | null;
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

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getAdminUsers(token);
      setUsers(data);

      // Buat map foto profile dari data yang sudah ada
      const photoMap: { [key: number]: string } = {};
      data.forEach((user) => {
        if (user.fotoProfile) {
          // Jika fotoProfile sudah berupa URL lengkap, gunakan langsung
          if (user.fotoProfile.startsWith("http")) {
            photoMap[user.idUser] = user.fotoProfile;
          } else {
            // Jika hanya nama file, gabungkan dengan base URL
            photoMap[
              user.idUser
            ] = `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${user.fotoProfile}`;
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

  // Listen for custom events from dialogs
  useEffect(() => {
    const handleUserAction = (event: CustomEvent) => {
      const { action, type } = event.detail;

      if (type === "start") {
        const progressInterval = showLoading();

        // Simpan interval ID untuk di-clear nanti
        window.currentProgressInterval = progressInterval;
      } else if (type === "success") {
        // Clear progress interval
        if (window.currentProgressInterval) {
          clearInterval(window.currentProgressInterval);
        }

        // Selesaikan progress
        setLoadingProgress(100);

        // Sembunyikan loading popup
        setTimeout(() => {
          setShowLoadingPopup(false);
          showSuccess(action);
        }, 500);

        // Refresh halaman setelah 2 detik
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (type === "error") {
        // Clear progress interval
        if (window.currentProgressInterval) {
          clearInterval(window.currentProgressInterval);
        }
        setShowLoadingPopup(false);
      }
    };

    window.addEventListener("userAction", handleUserAction as EventListener);
    return () => {
      window.removeEventListener(
        "userAction",
        handleUserAction as EventListener
      );
    };
  }, []);

  // Fungsi untuk mendapatkan URL foto profile user
  const getUserPhotoUrl = (user: User) => {
    // Prioritas: userPhotos (dari state) > fotoProfile (dari API) > fallback
    if (userPhotos[user.idUser]) {
      return userPhotos[user.idUser];
    }

    if (user.fotoProfile) {
      if (user.fotoProfile.startsWith("http")) {
        return user.fotoProfile;
      } else {
        return `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${user.fotoProfile}`;
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
