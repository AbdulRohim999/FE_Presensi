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
  const isMorningActive = isWithinTimeRange(7, 30, 8, 15); // Aktif sampai 10:15
  const isAfternoonActive = isWithinTimeRange(12, 0, 13, 30); // Aktif sampai 15:30
  const isSaturday = currentTime.getDay() === 6; // 6 adalah hari Sabtu
  const isEveningActive = isWithinTimeRange(16, 0, 21, 0) && !isSaturday; // Aktif sampai 23:00, dinonaktifkan di hari Sabtu

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

  // Format time for display
  const formatTimeRange = (
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number
  ): string => {
    const formatTime = (hour: number, minute: number): string => {
      return `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
    };

    return `${formatTime(startHour, startMinute)} - ${formatTime(
      endHour,
      endMinute
    )}`;
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
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6"
            variant={isMorningActive ? "default" : "secondary"}
            disabled={!isMorningActive || isLoading === "pagi"}
          >
            <Sun className="h-6 w-6" />
            <span>Absen Pagi</span>
            <span className="text-xs">{formatTimeRange(7, 30, 8, 15)}</span>
            {isLoading === "pagi" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          <Button
            onClick={() => handleAbsensi("siang")}
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 py-8 px-6"
            variant={isAfternoonActive ? "default" : "secondary"}
            disabled={!isAfternoonActive || isLoading === "siang"}
          >
            <Clock className="h-6 w-6" />
            <span>Absen Siang</span>
            <span className="text-xs">{formatTimeRange(12, 0, 13, 30)}</span>
            {isLoading === "siang" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          <Button
            onClick={() => handleAbsensi("sore")}
            className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 py-8 px-6"
            variant={isEveningActive ? "default" : "secondary"}
            disabled={!isEveningActive || isLoading === "sore"}
          >
            <Sunset className="h-6 w-6" />
            <span>Absen Sore</span>
            <span className="text-xs">{formatTimeRange(16, 0, 21, 0)}</span>
            {isLoading === "sore" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
