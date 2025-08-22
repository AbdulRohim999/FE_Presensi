"use client";

import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import {
  doAbsensi,
  getAbsensiHariIni,
  getServerTimeWIBAsDate,
} from "@/lib/api";
import { CheckCircle, Clock, Sun, Sunset } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AbsensiHariIni {
  absenPagi: string | null;
  absenSiang: string | null;
  absenSore: string | null;
  status: string;
}

export default function AbsensiDialog({ onClose }: { onClose?: () => void }) {
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState<"pagi" | "siang" | "sore" | null>(
    null
  );
  const [absensiHariIni, setAbsensiHariIni] = useState<AbsensiHariIni | null>(
    null
  );

  // State untuk pop-up loading dan success
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [successData, setSuccessData] = useState({
    waktu: "",
    status: "",
    tanggal: "",
  });

  // Auto close success dialog setelah 10 detik
  useEffect(() => {
    if (!showSuccessPopup) return;
    const timeoutId = setTimeout(() => {
      setShowSuccessPopup(false);
      setShowLoadingPopup(false);
      if (onClose) onClose();
    }, 10000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessPopup, onClose]);

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

  // Fetch data absensi hari ini
  const fetchAbsensiHariIni = async () => {
    if (!token) return;

    try {
      const data = await getAbsensiHariIni(token);
      setAbsensiHariIni(data);
    } catch (error) {
      console.error("Error fetching absensi hari ini:", error);
    }
  };

  // Fetch absensi hari ini saat komponen mount
  useEffect(() => {
    fetchAbsensiHariIni();
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
    ? isWithinTimeRange(7, 30, 11, 50)
    : false;

  // Siang: Senin-Jumat 12:00-15:40, Sabtu 13:00-21:00
  const isAfternoonActive = currentTime
    ? isSaturday
      ? isWithinTimeRange(13, 0, 21, 0)
      : isWithinTimeRange(12, 0, 15, 50)
    : false;

  // Sore: Hanya Senin-Jumat 16:00-21:00
  const isEveningActive = currentTime
    ? !isSaturday && isWithinTimeRange(16, 0, 21, 0)
    : false;

  // Check if absensi sudah dilakukan
  const isPagiDone = !!absensiHariIni?.absenPagi;
  const isSiangDone = !!absensiHariIni?.absenSiang;
  const isSoreDone = !!absensiHariIni?.absenSore;

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

    try {
      await doAbsensi(token, tipeAbsen);

      // Selesaikan progress
      setLoadingProgress(100);
      clearInterval(progressInterval);

      // Sembunyikan loading popup
      setTimeout(() => {
        setShowLoadingPopup(false);

        // Tampilkan success popup
        const waktuAbsen = currentTime
          ? currentTime.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZone: "Asia/Jakarta",
            })
          : "-";

        const tanggalAbsen = currentTime
          ? currentTime.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "-";

        // Tentukan status berdasarkan waktu
        let status = "TEPAT WAKTU";

        // Logika untuk menentukan terlambat (contoh sederhana)
        if (tipeAbsen === "pagi" && currentTime) {
          const jam = currentTime.getHours();
          const menit = currentTime.getMinutes();
          if (jam > 8 || (jam === 8 && menit > 15)) {
            status = "TERLAMBAT";
          }
        }

        setSuccessData({
          waktu: waktuAbsen,
          status: status,
          tanggal: tanggalAbsen,
        });

        setShowSuccessPopup(true);

        // Refresh halaman setelah 2 detik agar user bisa lihat success popup
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }, 500);

      // Refresh data absensi setelah berhasil
      await fetchAbsensiHariIni();

      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3000); // Delay lebih lama agar user bisa lihat success popup
      }
    } catch (error) {
      clearInterval(progressInterval);
      setShowLoadingPopup(false);

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
            className={`flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F] ${
              isPagiDone ? "bg-gray-400 text-gray-600 cursor-not-allowed" : ""
            }`}
            variant={
              isPagiDone
                ? "secondary"
                : isMorningActive
                ? "default"
                : "secondary"
            }
            disabled={!isMorningActive || isLoading === "pagi" || isPagiDone}
          >
            <Sun className="h-6 w-6" />
            <span>Absen Pagi</span>
            <span className="text-xs">07:30 - 08:15</span>
            {isPagiDone && (
              <span className="text-xs text-green-600 font-medium">
                Sudah Absen
              </span>
            )}
            {isLoading === "pagi" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          <Button
            onClick={() => handleAbsensi("siang")}
            className={`flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F] ${
              isSiangDone ? "bg-gray-400 text-gray-600 cursor-not-allowed" : ""
            }`}
            variant={
              isSiangDone
                ? "secondary"
                : isAfternoonActive
                ? "default"
                : "secondary"
            }
            disabled={
              !isAfternoonActive || isLoading === "siang" || isSiangDone
            }
          >
            <Clock className="h-6 w-6" />
            <span>Absen Siang</span>
            <span className="text-xs">
              {isSaturday ? "13:00 - 21:00" : "12:00 - 13:30"}
            </span>
            {isSiangDone && (
              <span className="text-xs text-green-600 font-medium">
                Sudah Absen
              </span>
            )}
            {isLoading === "siang" && (
              <span className="text-xs">Loading...</span>
            )}
          </Button>
          {!isSaturday && (
            <Button
              onClick={() => handleAbsensi("sore")}
              className={`flex min-h-[100px] w-full flex-col items-center justify-center gap-1 py-8 px-6 border-2 border-[#558B2F] ${
                isSoreDone ? "bg-gray-400 text-gray-600 cursor-not-allowed" : ""
              }`}
              variant={
                isSoreDone
                  ? "secondary"
                  : isEveningActive
                  ? "default"
                  : "secondary"
              }
              disabled={!isEveningActive || isLoading === "sore" || isSoreDone}
            >
              <Sunset className="h-6 w-6" />
              <span>Absen Sore</span>
              <span className="text-xs">16:00 - 21:00</span>
              {isSoreDone && (
                <span className="text-xs text-green-600 font-medium">
                  Sudah Absen
                </span>
              )}
              {isLoading === "sore" && (
                <span className="text-xs">Loading...</span>
              )}
            </Button>
          )}
        </div>
      </div>

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
                  Memproses Absensi
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
                  Absensi Berhasil!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Terima kasih, absensi Anda telah tercatat
                </p>
              </div>

              {/* Details Panel */}
              <div className="w-full bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Waktu Absen:</span>
                  <span className="text-sm font-medium">
                    {successData.waktu}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      successData.status === "TERLAMBAT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {successData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lokasi:</span>
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
                  if (onClose) onClose();
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
    </>
  );
}
