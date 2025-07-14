import { AxiosError } from "axios";
import apiClient from "./config";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8081";

// ==================== INTERFACES ====================

// Interface untuk response login dan profile
interface LoginResponse {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  token: string;
  nip: string;
  tipeUser: string;
  status: string;
  bidangKerja: string | null;
  alamat: string;
  phoneNumber: string;
  fotoProfile: string;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk request login
interface LoginRequest {
  email: string;
  password: string;
}

// Interface untuk response absensi
interface AbsensiResponse {
  tipeAbsen: string;
}

// Interface untuk response riwayat absensi
interface RiwayatAbsensi {
  idAbsensi: number;
  tanggal: string;
  absenPagi: string | null;
  statusPagi: string;
  absenSiang: string | null;
  statusSiang: string;
  absenSore: string | null;
  statusSore: string;
  status: string;
}

// Interface untuk parameter rentang tanggal
interface DateRangeParams {
  startDate: string;
  endDate: string;
}

// Interface untuk response perizinan
interface PerizinanResponse {
  idPerizinan: number;
  idUser: number;
  jenisIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  namaUser: string;
}

// Interface untuk request absensi
interface AbsensiRequest {
  tipeAbsen: "pagi" | "siang" | "sore";
}

// Interface untuk response profile
export interface ProfileResponse {
  idUser: number;
  firstname: string;
  lastname: string;
  tempatTanggalLahir: string;
  email: string;
  role: string;
  nip: string;
  tipeUser: string;
  status: string;
  bidangKerja: string | null;
  alamat: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  fotoProfile?: string;
  fotoProfileUrl?: string;
}

// Interface untuk response daftar pengguna admin
interface AdminUserResponse {
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
}

// Interface untuk response kehadiran hari ini (admin)
interface KehadiranHariIniResponse {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

// Interface untuk response daftar pengguna
interface DaftarPenggunaResponse {
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

// Interface untuk request tambah user
interface TambahUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  tipeUser: string;
  bidangKerja: string;
}

// Interface untuk request update user
interface UpdateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  nip: string;
  tipeUser: string;
  bidangKerja: string;
  status: string;
  alamat: string;
  phoneNumber: string;
}

// Interface untuk response kehadiran user
interface KehadiranUserResponse {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  tanggalAbsensi: string;
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

export interface PerizinanAdmin {
  idPerizinan: number;
  idUser: number;
  jenisIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  keterangan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  namaUser: string;
  lampiran?: string;
}

// Interface untuk response daftar admin
interface AdminResponse {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  nip: string | null;
  tipeUser: string | null;
  status: string | null;
  bidangKerja: string | null;
  alamat: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Interface untuk response laporan mingguan
interface LaporanMingguan {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  periode: string;
  tepatWaktu: number;
  terlambat: number;
  tidakMasuk: number;
  izin: number;
}

// Interface untuk response laporan bulanan
interface LaporanBulanan {
  idUser: number;
  namaUser: string;
  bidangKerja: string;
  periode: string;
  tepatWaktu: number;
  terlambat: number;
  tidakMasuk: number;
  izin: number;
}

// Interface untuk response total user
interface TotalUserResponse {
  total: number;
}

// Interface untuk response jumlah status kehadiran
interface JumlahStatusKehadiran {
  idUser: number;
  namaUser: string;
  tipeUser: string | null;
  role: string;
  bidangKerja: string | null;
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

// Interface untuk informasi admin
export interface InformasiAdmin {
  informasiId: number;
  judul: string;
  keterangan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdBy: string;
  targetTipeUser: string;
  createdAt: string;
  kategori: string;
}

// Interface untuk request create informasi
interface CreateInformasiRequest {
  judul: string;
  keterangan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  targetTipeUser: string;
  kategori: string;
}

// Interface untuk request update informasi
export interface UpdateInformasiRequest {
  judul?: string;
  keterangan?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  targetTipeUser?: string;
  kategori?: string;
}

// Interface untuk parameter periode
interface PeriodeParams {
  startDate: string;
  endDate: string;
}

// Interface untuk response pengecekan jaringan
interface NetworkCheckResponse {
  inCampusNetwork: boolean;
  clientIp: string;
}

// Interface untuk request tambah admin
export interface AddAdminRequest {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  role: string;
  status: string;
}

// Interface untuk response upload foto profile
export interface ProfilePhotoResponse {
  idUser: number;
  fotoProfile: string;
  fotoProfileUrl: string;
}

// Interface untuk request update admin
interface UpdateAdminRequest {
  firstname: string;
  lastname: string;
  email: string;
  status: string;
  alamat: string;
  phoneNumber: string;
}

// Interface untuk request ganti password
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interface untuk response error
interface ApiErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

// Interface for admin count response
interface AdminCountResponse {
  count: number;
}

// ==================== AUTH API ====================

// Fungsi untuk login
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post(`${BASE_URL}/api/auth/login`, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk logout
export const logout = async (token: string): Promise<void> => {
  try {
    await apiClient.post(
      `${BASE_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

// ==================== USER API ====================

// Fungsi untuk mendapatkan data user
export const getUserData = async (
  token: string
): Promise<Omit<LoginResponse, "token">> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk update profil user
export const updateUserProfile = async (
  token: string,
  data: Partial<ProfileResponse>
): Promise<Omit<LoginResponse, "token">> => {
  try {
    const response = await apiClient.put(`${BASE_URL}/api/user/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data absensi
export const getAbsensi = async (token: string): Promise<AbsensiResponse> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/user/absensi`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan riwayat absensi
export const getRiwayatAbsensi = async (
  token: string
): Promise<RiwayatAbsensi[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/riwayat`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan riwayat absensi berdasarkan rentang tanggal
export const getRiwayatAbsensiByRange = async (
  token: string,
  params: DateRangeParams
): Promise<RiwayatAbsensi[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/riwayat/range`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data absensi hari ini
export const getAbsensiHariIni = async (
  token: string
): Promise<RiwayatAbsensi> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/hari-ini`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data perizinan
export const getPerizinan = async (
  token: string
): Promise<PerizinanResponse[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/user/perizinan`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk membuat perizinan baru
export const createPerizinan = async (
  token: string,
  data: FormData
): Promise<PerizinanResponse> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/api/user/perizinan`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating perizinan:", error);
    throw error;
  }
};

// Fungsi untuk melakukan absensi
export const doAbsensi = async (
  token: string,
  tipeAbsen: "pagi" | "siang" | "sore"
): Promise<AbsensiResponse> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/api/user/absensi`,
      { tipeAbsen } as AbsensiRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data profile
export const getProfile = async (token: string): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan riwayat perizinan
export const getRiwayatPerizinan = async (
  token: string
): Promise<PerizinanResponse[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/perizinan/riwayat`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan laporan mingguan
export const getLaporanMingguan = async (
  token: string,
  week: number,
  month: number,
  year: number
): Promise<LaporanMingguan> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/laporan/minggu`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          week,
          month,
          year,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan laporan bulanan
export const getLaporanBulanan = async (
  token: string,
  month: number,
  year: number
): Promise<LaporanBulanan> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/laporan/bulan`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          month,
          year,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan semua informasi (user)
export const getUserInformasi = async (
  token: string
): Promise<InformasiAdmin[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/informasi/semua`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user informasi:", error);
    throw error;
  }
};

// ==================== ADMIN API ====================

// Fungsi untuk mendapatkan daftar pengguna (admin)
export const getAdminUsers = async (
  token: string
): Promise<AdminUserResponse[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan detail pengguna (admin)
export const getAdminUser = async (
  token: string
): Promise<AdminUserResponse> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan detail pengguna berdasarkan ID (admin)
export const getAdminUserById = async (
  token: string,
  id: number
): Promise<AdminUserResponse> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data kehadiran hari ini (admin)
export const getKehadiranHariIni = async (
  token: string
): Promise<KehadiranHariIniResponse[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/kehadiran/hari-ini`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan daftar pengguna
export const getDaftarPengguna = async (
  token: string
): Promise<DaftarPenggunaResponse[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk menambah user baru
export const tambahUser = async (
  token: string,
  data: TambahUserRequest
): Promise<DaftarPenggunaResponse> => {
  try {
    const response = await apiClient.post(`${BASE_URL}/api/admin/users`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mengupdate user
export const updateUser = async (
  token: string,
  userId: number,
  data: UpdateUserRequest
): Promise<DaftarPenggunaResponse> => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/api/admin/users/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk menghapus user
export const deleteUser = async (
  token: string,
  userId: number
): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/api/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan data kehadiran user
export const getKehadiranUser = async (
  token: string,
  userId: number
): Promise<KehadiranUserResponse[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/kehadiran/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as KehadiranUserResponse[];
  } catch (error) {
    throw error;
  }
};

export const getAllPerizinanAdmin = async (
  token: string
): Promise<PerizinanAdmin[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/perizinan/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as PerizinanAdmin[];
  } catch (error) {
    throw error;
  }
};

export const updateStatusPerizinanAdmin = async (
  idPerizinan: number,
  status: string,
  token: string
) => {
  const cleanToken = token.replace(/^"(.*)"$/, "$1");

  const response = await apiClient.put(
    `${BASE_URL}/api/admin/perizinan/${idPerizinan}/status`,
    {}, // jika tidak ada body
    {
      params: { status }, // query param
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

// Fungsi untuk mendapatkan total user berdasarkan tipe
export const getTotalUsersByType = async (
  token: string,
  tipeUser: string
): Promise<TotalUserResponse> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/users/total/tipe-user/${tipeUser}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan jumlah status kehadiran
export const getJumlahStatusKehadiran = async (
  token: string
): Promise<JumlahStatusKehadiran[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/kehadiran/jumlah-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan jumlah status kehadiran berdasarkan periode
export const getJumlahStatusKehadiranPeriode = async (
  token: string,
  params: PeriodeParams
): Promise<JumlahStatusKehadiran[]> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/admin/kehadiran/jumlah-status/periode`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan semua informasi (admin)
export const getAllInformasi = async (
  token: string
): Promise<InformasiAdmin[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/admin/informasi`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching informasi:", error);
    throw error;
  }
};

// Fungsi untuk membuat informasi baru (admin)
export const createInformasi = async (
  token: string,
  data: CreateInformasiRequest
): Promise<InformasiAdmin> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/api/admin/informasi`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating informasi:", error);
    throw error;
  }
};

// Fungsi untuk memperbarui informasi (admin)
export const updateInformasi = async (
  token: string,
  informasiId: number,
  data: Partial<UpdateInformasiRequest>
): Promise<InformasiAdmin> => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/api/admin/informasi/${informasiId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating informasi:", error);
    throw error;
  }
};

// Fungsi untuk menghapus informasi (admin)
export const deleteInformasi = async (
  token: string,
  informasiId: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(
      `${BASE_URL}/api/admin/informasi/${informasiId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting informasi:", error);
    throw error;
  }
};

// ==================== SUPER ADMIN API ====================

// Fungsi untuk mendapatkan daftar admin (superadmin)
export const getSuperAdminAdmins = async (
  token: string
): Promise<AdminResponse[]> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/superadmin/admins`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getSuperAdminAdmins:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan total admin (Super Admin)
export const getSuperAdminTotalAdmins = async (
  token: string
): Promise<AdminCountResponse> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/superadmin/admins/count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in getSuperAdminTotalAdmins:", error);
    throw error;
  }
};

// Fungsi untuk mengecek jaringan kampus
export const checkCampusNetwork = async (
  token: string
): Promise<NetworkCheckResponse> => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/api/user/absensi/check-network`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk menambah admin baru
export const addAdmin = async (
  token: string,
  data: AddAdminRequest
): Promise<AdminResponse> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/api/superadmin/admins`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk mendapatkan foto profil
export const getProfilePhoto = async (
  token: string
): Promise<ProfilePhotoResponse> => {
  try {
    const response = await apiClient.get(`${BASE_URL}/api/user/profile/photo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    throw error;
  }
};

// Fungsi untuk mengupdate data admin
export const updateAdmin = async (
  token: string,
  adminId: number,
  data: UpdateAdminRequest
): Promise<AdminResponse> => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/api/superadmin/admins/${adminId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

// Fungsi untuk menghapus admin
export const deleteAdmin = async (
  token: string,
  adminId: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(
      `${BASE_URL}/api/superadmin/admins/${adminId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

// Fungsi untuk mengubah password
export const changePassword = async (
  token: string,
  data: ChangePasswordRequest
): Promise<{ message: string }> => {
  try {
    console.log("Sending password change request with data:", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    const response = await apiClient.post(
      `${BASE_URL}/api/user/profile/change-password`,
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiErrorResponse;
      console.error("Error changing password:", {
        status: error.response?.status,
        data: errorData,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        },
      });
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Fungsi untuk update foto profil user
export const updateUserProfilePhoto = async (
  token: string,
  formData: FormData
): Promise<ProfilePhotoResponse> => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/api/user/profile/photo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type, biarkan browser mengatur otomatis untuk FormData
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user profile photo:", error);
    throw error;
  }
};

// Fungsi untuk mengganti password user oleh admin
export const changeUserPasswordByAdmin = async (
  token: string,
  userId: number,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.put(
      `${BASE_URL}/api/admin/users/${userId}/password`,
      { newPassword, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
