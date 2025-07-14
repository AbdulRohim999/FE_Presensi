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
import { getProfilePhoto, getUserData } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileData {
  idUser: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  tipeUser: string;
  status: string;
  bidangKerja: string | null;
  alamat: string;
  phoneNumber: string;
  fotoProfile: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfilePhoto {
  idUser: number;
  fotoProfile: string;
  fotoProfileUrl: string;
}

export function Navbar() {
  const router = useRouter();
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const [profileData, photoData] = await Promise.all([
          getUserData(token),
          getProfilePhoto(token),
        ]);
        setProfile(profileData);
        setProfilePhoto(photoData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Gagal memuat data profil");
      }
    };

    fetchProfile();
  }, [token]);

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
      <h1
        className="text-3xl font-bold text-center flex-1"
        style={{ color: "#F8F9FA" }}
      >
        Sekolah Tinggi Teknologi Payakumbuh
      </h1>
      <div className="w-[240px] flex justify-end items-center gap-2">
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
            <DropdownMenuItem onClick={() => router.push("/Admin/Profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/Admin/GantiPassword")}
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
