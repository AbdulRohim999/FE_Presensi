"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { doAbsensi, getServerTimeWIBAsDate } from "@/lib/api";
import { Clock, Sun, Sunset } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AbsensiDialog({ onClose }: { onClose?: () => void }) {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState<"pagi" | "siang" | "sore" | null>(
    null
  );

  // Update waktu server setiap detik
  useEffect(() => {
    const fetchTime = async () => {
      try {
        const serverDate = await getServerTimeWIBAsDate(token!);
        setCurrentTime(serverDate);
      } catch (error) {
        console.error("Error fetching server time:", error);
        // Tidak menggunakan fallback ke waktu lokal
        // Biarkan currentTime tetap null jika server tidak tersedia
      }
    };

    // Hanya fetch jika ada token
    if (token) {
      fetchTime();
      intervalRef.current = setInterval(fetchTime, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);

  // Function to check if current time is within a specific range
  const isWithinTimeRange = (
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): boolean => {
    const now = currentTime;
    const currentHour = now ? now.getHours() : 0;
    const currentMinute = now ? now.getMinutes() : 0;

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    return (
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes <= endTotalMinutes
    );
  };

  // Check if each absensi time is active
  const isSaturday = currentTime ? currentTime.getDay() === 6 : false; // 6 adalah hari Sabtu

  // Pagi: 07:30 - 11:40 (Senin-Sabtu)
  const isMorningActive = currentTime
    ? isWithinTimeRange(7, 30, 11, 40)
    : false;

  // Siang: Senin-Jumat 12:00-15:40, Sabtu 13:00-21:00
  const isAfternoonActive = currentTime
    ? isSaturday
      ? isWithinTimeRange(13, 0, 21, 0)
      : isWithinTimeRange(12, 0, 15, 40)
    : false;

  // Sore: Hanya Senin-Jumat 16:00-21:00
  const isEveningActive = currentTime
    ? !isSaturday && isWithinTimeRange(16, 0, 21, 0)
    : false;

  const handleAbsensi = async (tipeAbsen: "pagi" | "siang" | "sore") => {
    if (!token) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }

    // Validasi waktu absensi
    let isValidTime = false;
    switch (tipeAbsen) {
      case "pagi":
        isValidTime = isMorningActive;
        break;
      case "siang":
        isValidTime = isAfternoonActive;
        break;
      case "sore":
        isValidTime = isEveningActive;
        break;
    }

    if (!isValidTime) {
      toast("Waktu absensi tidak valid", {
        description: `Anda tidak dapat absen ${tipeAbsen} di luar jam yang ditentukan`,
        action: { label: "Tutup", onClick: () => {} },
        style: { background: "#fffbe6", color: "#ad8b00" },
      });
      return;
    }

    setIsLoading(tipeAbsen);
    try {
      await doAbsensi(token, tipeAbsen);
      toast.success(
        `Absensi ${tipeAbsen} berhasil pada ${
          currentTime
            ? currentTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Asia/Jakarta",
              })
            : "-"
        } (WIB)`
      );
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000); // beri jeda 1 detik agar user lihat alert
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast("Gagal melakukan absensi", {
          description: `Terjadi kesalahan tidak diketahui saat absen ${tipeAbsen}`,
          action: { label: "Tutup", onClick: () => {} },
          style: { background: "#fff1f0", color: "#cf1322" },
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-xl font-bold">
          Absen
        </DialogTitle>
        <p className="text-center text-sm text-muted-foreground">
          Waktu saat ini:{" "}
          {currentTime
            ? currentTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Asia/Jakarta",
              })
            : "Server tidak tersedia"}
          <br />
          <br />
        </p>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button
            onClick={() => handleAbsensi("pagi")}
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F]"
            variant={isMorningActive ? "default" : "secondary"}
            disabled={!isMorningActive || isLoading === "pagi"}
          >
            <Sun className="h-6 w-6" />
            <span>Absen Pagi</span>
            <span className="text-xs">07:30 - 11:40</span>
            {isLoading === "pagi" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          <Button
            onClick={() => handleAbsensi("siang")}
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F]"
            variant={isAfternoonActive ? "default" : "secondary"}
            disabled={!isAfternoonActive || isLoading === "siang"}
          >
            <Clock className="h-6 w-6" />
            <span>Absen Siang</span>
            <span className="text-xs">
              {isSaturday ? "13:00 - 21:00" : "12:00 - 15:40"}
            </span>
            {isLoading === "siang" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          {!isSaturday && (
            <Button
              onClick={() => handleAbsensi("sore")}
              className="flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F]"
              variant={isEveningActive ? "default" : "secondary"}
              disabled={!isEveningActive || isLoading === "sore"}
            >
              <Sunset className="h-6 w-6" />
              <span>Absen Sore</span>
              <span className="text-xs">16:00 - 21:00</span>
              {isLoading === "sore" && (
                <span className="text-xs">Loading...</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
