"use client";

import { Navbar } from "@/app/SuperAdmin/components/Navbar";
import { Sidebar } from "@/app/SuperAdmin/components/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { getProfile, getProfilePhoto, ProfileResponse } from "@/lib/api";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import EditInformasiDialog from "./Dialog/EditInformasiDialog";
import EditProfileDialog from "./Dialog/EditProfileDialog";

interface ProfilePhoto {
  idUser: number;
  fotoProfile: string;
  fotoProfileUrl: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openInformasi, setOpenInformasi] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }
        const [profileData, photoData] = await Promise.all([
          getProfile(token),
          getProfilePhoto(token),
        ]);
        setProfile(profileData);
        setProfilePhoto(photoData);
      } catch (error) {
        console.error("Error mengambil data profile:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: Partial<ProfileResponse>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedProfile });
      // Refresh profile photo data
      if (updatedProfile.fotoProfileUrl) {
        setProfilePhoto({
          idUser: profile.idUser,
          fotoProfile: updatedProfile.fotoProfile || "",
          fotoProfileUrl: updatedProfile.fotoProfileUrl,
        });
      }
      setOpen(false);
    }
  };

  const handleInformasiUpdate = (
    updatedInformasi: Partial<ProfileResponse>
  ) => {
    if (profile) {
      setProfile({ ...profile, ...updatedInformasi });
      setOpenInformasi(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Data profile tidak ditemukan</div>;
  }

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Kelola informasi profil Anda
                </p>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ">
              {/* Left Column: Profile */}
              <Card className="h-full w-90">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profil Super Admin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage
                          src={
                            profilePhoto?.fotoProfileUrl ||
                            "/public/STTPayakumbuh.png"
                          }
                          alt={`${profile.firstname} ${profile.lastname}`}
                        />
                        <AvatarFallback className="text-4xl">
                          {profile.firstname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-8 right-0 rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                        onClick={() => setOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <EditProfileDialog
                        profile={profile}
                        onProfileUpdate={handleProfileUpdate}
                        open={open}
                        onOpenChange={setOpen}
                      />
                    </div>
                    <h2 className="text-2xl font-bold">{`${profile.firstname} ${profile.lastname}`}</h2>
                    <p className="text-muted-foreground mb-2">
                      {profile.email}
                    </p>
                    <Badge className="bg-blue-500 hover:bg-blue-600 mb-4">
                      {profile.role}
                    </Badge>

                    <div className="w-full mt-6 space-y-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">NIDN</span>
                        <span>{profile.nip}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Bidang Kerja</span>
                        <span>{profile.bidangKerja || "-"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-medium">Status</span>
                        <span className="text-green-500">{profile.status}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Detailed Information */}
              <Card className="h-full md:col-span-2">
                <CardHeader>
                  <CardTitle>Informasi Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">Firstname</Label>
                      <Input
                        id="firstname"
                        name="firstname"
                        value={profile.firstname}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Lastname</Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        value={profile.lastname}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempatTanggalLahir">
                        Tempat, Tanggal Lahir
                      </Label>
                      <Input
                        id="tempatTanggalLahir"
                        name="tempatTanggalLahir"
                        value={profile.tempatTanggalLahir || "-"}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nip">NIDN</Label>
                      <Input id="nip" name="nip" value={profile.nip} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bidangKerja">Bidang Kerja</Label>
                      <Input
                        id="bidangKerja"
                        name="bidangKerja"
                        value={profile.bidangKerja || "-"}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Nomor HP</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={profile.phoneNumber || "-"}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      name="alamat"
                      value={profile.alamat || "-"}
                      disabled
                      rows={3}
                    />
                  </div>
                  <div className="mt-6">
                    <Dialog
                      open={openInformasi}
                      onOpenChange={setOpenInformasi}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit Informasi</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <EditInformasiDialog
                          profile={profile}
                          onInformasiUpdate={handleInformasiUpdate}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
