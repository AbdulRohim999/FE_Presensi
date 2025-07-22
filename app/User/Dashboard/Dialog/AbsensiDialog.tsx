"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { doAbsensi } from "@/lib/api";
import { Clock, Sun, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AbsensiDialog() {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState<"pagi" | "siang" | "sore" | null>(
    null
  );

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to check if current time is within a specific range
  const isWithinTimeRange = (
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): boolean => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Tambah 3 jam 20 menit (200 menit) ke waktu akhir
    const extendedEndTotalMinutes = endTotalMinutes + 200;

    return (
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes <= extendedEndTotalMinutes
    );
  };

  // Check if each absensi time is active
  const isSaturday = currentTime.getDay() === 6; // 6 adalah hari Sabtu
  const isMorningActive = isWithinTimeRange(7, 30, 8, 15); // Aktif sampai 10:15
  // Untuk Sabtu, absen siang 13:00-20:00, selain itu 12:00-13:30
  const isAfternoonActive = isSaturday
    ? isWithinTimeRange(13, 0, 15, 59)
    : isWithinTimeRange(12, 0, 13, 30); // Sabtu: 13:00-19:59, selain itu: 12:00-13:30
  // Untuk Sabtu, tidak ada absen sore
  const isEveningActive = !isSaturday && isWithinTimeRange(16, 0, 21, 0); // Aktif sampai 23:00, dinonaktifkan di hari Sabtu

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
      toast.error(`Waktu absen ${tipeAbsen} tidak valid`);
      return;
    }

    setIsLoading(tipeAbsen);
    try {
      await doAbsensi(token, tipeAbsen);
      toast.success(
        `Absensi ${tipeAbsen} berhasil pada ${currentTime.toLocaleTimeString()}`
      );
      // Refresh data absensi jika diperlukan
    } catch (error) {
      console.error(`Error melakukan absensi ${tipeAbsen}:`, error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(`Gagal melakukan absensi ${tipeAbsen}`);
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
          Waktu saat ini: {currentTime.toLocaleTimeString()}
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
            <span className="text-xs">07:30 - 08:15</span>
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
              {isSaturday ? "13:00 - 15:59" : "12:00 - 13:30"}
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
