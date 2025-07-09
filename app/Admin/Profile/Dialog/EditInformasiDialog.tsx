"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ProfileResponse, updateUserProfile } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define the form schema with validation
const formSchema = z.object({
  firstname: z
    .string()
    .min(2, { message: "Firstname harus diisi minimal 2 karakter" }),
  lastname: z
    .string()
    .min(2, { message: "Lastname harus diisi minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  nip: z.string().min(2, { message: "NIDN harus diisi minimal 2 karakter" }),
  bidangKerja: z.string().min(2, { message: "Bidang Kerja harus dipilih" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Nomor HP harus diisi minimal 10 karakter" }),
  alamat: z
    .string()
    .min(5, { message: "Alamat harus diisi minimal 5 karakter" }),
  tempatTanggalLahir: z.string(),
});

// Define type for form data
type FormData = z.infer<typeof formSchema>;

interface EditInformasiDialogProps {
  profile: ProfileResponse;
  onInformasiUpdate: (data: Partial<ProfileResponse>) => void;
}

export default function EditInformasiDialog({
  profile,
  onInformasiUpdate,
}: EditInformasiDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: profile?.firstname || "",
      lastname: profile?.lastname || "",
      email: profile?.email || "",
      tempatTanggalLahir: profile?.tempatTanggalLahir || "",
      nip: profile?.nip || "",
      bidangKerja: profile?.bidangKerja || "",
      phoneNumber: profile?.phoneNumber || "",
      alamat: profile?.alamat || "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Siapkan data untuk dikirim ke API
      const updateData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        tempatTanggalLahir: data.tempatTanggalLahir,
        nip: data.nip,
        bidangKerja: data.bidangKerja,
        phoneNumber: data.phoneNumber,
        alamat: data.alamat,
      };
      // Kirim data ke API
      const response = await updateUserProfile(token, updateData);

      // Update state di parent component
      onInformasiUpdate(response);

      toast({
        title: "Berhasil",
        description: "Informasi berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast({
            title: "Error",
            description: "Akses ditolak. Silakan coba lagi.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              error.response?.data?.message || "Gagal memperbarui informasi",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Gagal memperbarui informasi",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firstname</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan firstname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan email"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bidangKerja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bidang Kerja</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan Bidang Kerja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor HP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lastname</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan lastname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tempatTanggalLahir"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempat Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan Tempat Tanggal Lahir"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIDN</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan NIDN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Alamat (Full Width) */}
        <FormField
          control={form.control}
          name="alamat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan alamat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
