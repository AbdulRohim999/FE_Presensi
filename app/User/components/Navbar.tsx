"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import {
  getProfilePhoto,
  getUserData,
  getUserInformasi,
  InformasiAdmin,
} from "@/lib/api";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfilePhoto {
  idUser: number;
  fotoProfile: string;
  fotoProfileUrl: string;
}

interface ProfileData {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
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

export function Navbar() {
  const { token } = useAuth();
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hasNewInformasi, setHasNewInformasi] = useState(false);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!token) return;

      try {
        const data = await getProfilePhoto(token);
        setProfilePhoto(data);
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      }
    };

    const fetchProfileData = async () => {
      if (!token) return;

      try {
        const data = await getUserData(token);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfilePhoto();
    fetchProfileData();
  }, [token]);

  // Listen for profile photo updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!token) return;
      try {
        const data = await getProfilePhoto(token);
        setProfilePhoto(data);
      } catch (error) {
        console.error("Error refreshing profile photo:", error);
      }
    };

    // Add event listener for profile updates
    window.addEventListener("profilePhotoUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profilePhotoUpdated", handleProfileUpdate);
    };
  }, [token]);

  // Fungsi untuk mendapatkan key localStorage per user
  const getLastReadKey = (idUser: number) =>
    `lastReadInformasiId_user_${idUser}`;

  // Cek informasi aktif dan bandingkan dengan yang sudah dibaca user
  useEffect(() => {
    const fetchInformasi = async () => {
      if (!token || !profile) return;
      try {
        const data = await getUserInformasi(token);
        const today = new Date();
        // Ambil info aktif dan id terbesar
        const aktifList = data.filter((info: InformasiAdmin) => {
          const mulai = new Date(info.tanggalMulai);
          const selesai = new Date(info.tanggalSelesai);
          return today >= mulai && today <= selesai;
        });
        const maxId =
          aktifList.length > 0
            ? Math.max(...aktifList.map((i) => i.informasiId))
            : 0;
        const lastReadId = Number(
          localStorage.getItem(getLastReadKey(profile.idUser)) || 0
        );
        setHasNewInformasi(maxId > lastReadId);
      } catch {
        setHasNewInformasi(false);
      }
    };
    fetchInformasi();
  }, [token, profile]);

  return (
    <nav
      className="flex items-center justify-between p-4 shadow-sm border-b h-20.5"
      style={{
        background: "#343A40",
        color: "#F8F9FA",
        borderBottom: "2px solid #8BC34A",
      }}
    >
      <div className="w-[240px]"></div>
      <h2
        className="text-3xl font-bold text-center flex-1"
        style={{ color: "#F8F9FA" }}
      >
        Sekolah Tinggi Teknologi Payakumbuh
      </h2>
      <div className="w-[240px] flex justify-end items-center gap-2">
        {/* Icon Lonceng */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full hover:bg-[#cccccc] relative"
          style={{ color: "#F8F9FA" }}
          onClick={async () => {
            if (!token || !profile) return;
            // Ambil info aktif dan id terbesar
            try {
              const data = await getUserInformasi(token);
              const today = new Date();
              const aktifList = data.filter((info: InformasiAdmin) => {
                const mulai = new Date(info.tanggalMulai);
                const selesai = new Date(info.tanggalSelesai);
                return today >= mulai && today <= selesai;
              });
              const maxId =
                aktifList.length > 0
                  ? Math.max(...aktifList.map((i) => i.informasiId))
                  : 0;
              localStorage.setItem(
                getLastReadKey(profile.idUser),
                String(maxId)
              );
              setHasNewInformasi(false);
            } catch {}
            router.push("/User/Informasi");
          }}
        >
          <Bell className="h-5 w-5" color="#F8F9FA" />
          {hasNewInformasi && (
            <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-600 border-2 border-white flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">!</span>
            </span>
          )}
        </Button>

        {/* Icon User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full hover:bg-[#0d4f4e]"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={profilePhoto?.fotoProfileUrl || "/avatars/user.png"}
                  alt={`${profile?.firstname || "User"} ${
                    profile?.lastname || ""
                  }`}
                />
                <AvatarFallback>
                  {profile?.firstname
                    ? profile.firstname.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.firstname} {profile?.lastname}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/User/Profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/User/GantiPassword")}
            >
              Ganti Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
