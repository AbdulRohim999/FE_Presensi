"use client";

import { Navbar } from "@/app/Admin/components/Navbar";
import { Sidebar } from "@/app/Admin/components/Sidebar";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import {
  getJumlahStatusKehadiranPeriode,
  getLaporanBulananAdmin,
} from "@/lib/api";
import {
  AlignmentType,
  Document,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
  Packer,
  Paragraph,
  TextRun,
  WidthType,
} from "docx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileDown, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface User {
  idUser: number;
  namaUser: string;
  tipeUser: string | null;
  role: string;
  bidangKerja: string | null;
  validCount: number;
  invalidCount: number;
  totalCount: number;
}

// Untuk mendukung doc.lastAutoTable pada TypeScript
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: { finalY?: number };
  }
}

export default function AttendanceReport() {
  const router = useRouter();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (month: string) => {
    const months = {
      "1": "Januari",
      "2": "Februari",
      "3": "Maret",
      "4": "April",
      "5": "Mei",
      "6": "Juni",
      "7": "Juli",
      "8": "Agustus",
      "9": "September",
      "10": "Oktober",
      "11": "November",
      "12": "Desember",
    };
    return months[month as keyof typeof months] || "";
  };

  // Fungsi untuk mendapatkan deskripsi berdasarkan filter
  const getDescription = () => {
    const description = "Laporan Kehadiran Dosen Dan Karyawan STT Payakumbuh";
    let filterDescription = "";

    if (date?.from) {
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = getMonthName((date.getMonth() + 1).toString());
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const startDate = formatDate(date.from);
      const endDate = date.to ? formatDate(date.to) : startDate;
      filterDescription = `pada ${startDate} hingga ${endDate}`;
    } else if (selectedMonth !== "all") {
      filterDescription = `Bulan ${getMonthName(
        selectedMonth
      )} ${selectedYear}`;
    }

    return `${description}${filterDescription ? ` ${filterDescription}` : ""}`;
  };

  // Helper: teks periode rapi
  const getPeriodText = (): string => {
    if (date?.from) {
      const fmt = (d: Date) =>
        d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      const from = fmt(date.from);
      const to = fmt(date.to ?? date.from);
      return `${from} – ${to}`;
    }
    // Jika tidak pilih range, pakai bulan/tahun
    if (selectedMonth !== "all") {
      return `01 ${getMonthName(selectedMonth)} – 31 ${getMonthName(
        selectedMonth
      )} ${selectedYear}`;
    }
    return new Date().toLocaleDateString("id-ID");
  };

  // Helper: dapatkan bulan untuk tanda tangan
  const getSignatureMonth = (): string => {
    if (date?.from) {
      return date.from.toLocaleDateString("id-ID", { month: "long" });
    }
    if (selectedMonth !== "all") {
      return getMonthName(selectedMonth);
    }
    return new Date().toLocaleDateString("id-ID", { month: "long" });
  };

  // Helper: dapatkan tahun untuk tanda tangan
  const getSignatureYear = (): string => {
    if (date?.from) {
      return date.from.getFullYear().toString();
    }
    if (selectedMonth !== "all") {
      return selectedYear;
    }
    return new Date().getFullYear().toString();
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      let data;

      if (date?.from) {
        const params = {
          startDate: date.from.toISOString().split("T")[0],
          endDate: date.to
            ? date.to.toISOString().split("T")[0]
            : date.from.toISOString().split("T")[0],
        };
        data = await getJumlahStatusKehadiranPeriode(token, params);
      } else if (selectedMonth !== "all") {
        // Gunakan endpoint laporan bulanan admin
        data = await getLaporanBulananAdmin(
          token,
          Number.parseInt(selectedMonth),
          Number.parseInt(selectedYear)
        );

        // Transform data dari format LaporanBulananAdmin ke format User
        if (Array.isArray(data)) {
          data = data.map((item) => ({
            idUser: item.idUser,
            namaUser: item.namaUser,
            tipeUser: null, // Tidak ada di response, bisa ditambahkan nanti
            role: "", // Tidak ada di response, bisa ditambahkan nanti
            bidangKerja: item.bidangKerja,
            validCount: item.valid,
            invalidCount: item.invalid,
            totalCount: item.total,
          }));
        }
      } else {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = new Date().toISOString().split("T")[0];
        data = await getJumlahStatusKehadiranPeriode(token, {
          startDate,
          endDate,
        });
      }

      console.log("Data dari API:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Data yang diterima bukan array:", data);
        toast.error("Format data tidak valid");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, date, selectedMonth, selectedYear]);

  // Filter data berdasarkan pencarian dan tipe user
  const filteredData = users.filter((record) => {
    const fullName = record.namaUser.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Urutkan berdasarkan validCount terbanyak
  const sortedData = [...filteredData].sort(
    (a, b) => b.validCount - a.validCount
  );

  const summary = useMemo(() => {
    if (sortedData.length === 0) {
      return {
        avgValid: 0,
        avgInvalid: 0,
        avgTotal: 0,
        percentValid: 0,
        percentInvalid: 0,
      };
    }

    const totalUsers = sortedData.length;
    const sumValid = sortedData.reduce((acc, user) => acc + user.validCount, 0);
    const sumInvalid = sortedData.reduce(
      (acc, user) => acc + user.invalidCount,
      0
    );
    const sumTotal = sortedData.reduce((acc, user) => acc + user.totalCount, 0);

    return {
      avgValid: sumValid / totalUsers,
      avgInvalid: sumInvalid / totalUsers,
      avgTotal: sumTotal / totalUsers,
      percentValid: sumTotal > 0 ? (sumValid / sumTotal) * 100 : 0,
      percentInvalid: sumTotal > 0 ? (sumInvalid / sumTotal) * 100 : 0,
    };
  }, [sortedData]);

  const handleUserClick = (userId: number) => {
    router.push(`/Admin/LaporanKehadiran/LaporanUser/${userId}`);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      // Header
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(18);
      doc.text("LAPORAN KEHADIRAN", pageWidth / 2, 60, { align: "center" });
      doc.setFontSize(12);
      doc.text("STT Payakumbuh", pageWidth / 2, 80, { align: "center" });
      doc.text(
        "Laporan Kehadiran Seluruh Dosen Dan Karyawan STT Payakumbuh",
        pageWidth / 2,
        98,
        { align: "center" }
      );
      doc.text(`Pada Tanggal: ${getPeriodText()}`, 60, 122);

      // Tanggal cetak
      const currentDate = new Date().toLocaleDateString("id-ID");
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${currentDate}`, 60, 140);

      // Prepare table data
      const tableData = sortedData.map((record, index) => [
        index + 1,
        record.namaUser,
        record.bidangKerja || "-",
        record.validCount.toString(),
        record.invalidCount.toString(),
        record.totalCount.toString(),
      ]);

      // Footer row for percentage only (tanpa rata-rata)
      const footData = [
        "",
        "Persentase",
        "",
        "",
        `(${summary.percentValid.toFixed(1)}%)`,
        `(${summary.percentInvalid.toFixed(1)}%)`,
      ];

      // Add table
      autoTable(doc, {
        head: [["No", "Nama", "Bidang Kerja", "Valid", "Invalid", "Total"]],
        body: tableData,
        foot: [footData],
        startY: 158,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 6,
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "center" },
          1: { cellWidth: 180 },
          2: { cellWidth: 140 },
          3: { cellWidth: 70, halign: "center" },
          4: { cellWidth: 70, halign: "center" },
          5: { cellWidth: 70, halign: "center" },
        },
        footStyles: {
          fillColor: [235, 235, 235],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      // Signature section
      let y = doc.lastAutoTable?.finalY ?? 180;
      y += 24;
      const signatureMonth = getSignatureMonth();
      const signatureYear = getSignatureYear();
      doc.setFontSize(11);
      doc.text(
        `Payakumbuh, ${signatureMonth} ${signatureYear}`,
        pageWidth - 200,
        y
      );
      y += 16;
      doc.text("Mengetahui,", pageWidth - 200, y);
      y += 56;
      doc.text("(Dr. Zulkifli, S.Kom, M.Kom)", pageWidth - 230, y);
      y += 6;
      doc.text("____________________________", pageWidth - 260, y);

      // Save the PDF
      doc.save(
        `Laporan_Kehadiran_${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("Laporan PDF berhasil diunduh");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh laporan PDF");
    }
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = sortedData.map((record, index) => ({
        No: index + 1,
        Nama: record.namaUser,
        "Bidang Kerja": record.bidangKerja || "-",
        Valid: record.validCount,
        Invalid: record.invalidCount,
        Total: record.totalCount,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([]);

      // Header information
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          ["LAPORAN KEHADIRAN"],
          ["STT Payakumbuh"],
          ["Laporan Kehadiran Seluruh Dosen Dan Karyawan STT Payakumbuh"],
          [`Pada Tanggal: ${getPeriodText()}`],
          [`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`],
          [],
        ],
        { origin: "A1" }
      );

      // Header row
      XLSX.utils.sheet_add_aoa(
        ws,
        [["No", "Nama", "Bidang Kerja", "Valid", "Invalid", "Total"]],
        { origin: "A7" }
      );

      // Data rows
      XLSX.utils.sheet_add_json(ws, excelData, { origin: "A8" });

      // Percent row (tanpa rata-rata)
      const percentRow = [
        "",
        "Persentase",
        "",
        `${summary.percentValid.toFixed(1)}%`,
        `${summary.percentInvalid.toFixed(1)}%`,
        "",
      ];
      XLSX.utils.sheet_add_aoa(ws, [percentRow], {
        origin: `A${excelData.length + 8}`,
      });

      // Column widths
      ws["!cols"] = [
        { wch: 5 },
        { wch: 28 },
        { wch: 22 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kehadiran");

      // Save the file
      XLSX.writeFile(
        wb,
        `Laporan_Kehadiran_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      toast.success("Laporan Excel berhasil diunduh");
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast.error("Gagal mengunduh laporan Excel");
    }
  };

  const handleDownloadWord = async () => {
    try {
      // Create table rows for Word document
      const tableRows = [
        // Header row
        new DocxTableRow({
          children: [
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "No", bold: true })],
                }),
              ],
              width: { size: 8, type: WidthType.PERCENTAGE },
            }),
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Nama", bold: true })],
                }),
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
            }),
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Bidang Kerja", bold: true })],
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Valid", bold: true })],
                }),
              ],
              width: { size: 11, type: WidthType.PERCENTAGE },
            }),
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Invalid", bold: true })],
                }),
              ],
              width: { size: 11, type: WidthType.PERCENTAGE },
            }),
            new DocxTableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Total", bold: true })],
                }),
              ],
              width: { size: 10, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        // Data rows
        ...sortedData.map(
          (record, index) =>
            new DocxTableRow({
              children: [
                new DocxTableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun((index + 1).toString())],
                    }),
                  ],
                }),
                new DocxTableCell({
                  children: [
                    new Paragraph({ children: [new TextRun(record.namaUser)] }),
                  ],
                }),
                new DocxTableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(record.bidangKerja || "-")],
                    }),
                  ],
                }),
                new DocxTableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(record.validCount.toString())],
                    }),
                  ],
                }),
                new DocxTableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(record.invalidCount.toString())],
                    }),
                  ],
                }),
                new DocxTableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun(record.totalCount.toString())],
                    }),
                  ],
                }),
              ],
            })
        ),
        // Persentase saja
        new DocxTableRow({
          children: [
            new DocxTableCell({ children: [new Paragraph("")] }),
            new DocxTableCell({ children: [new Paragraph("Persentase")] }),
            new DocxTableCell({ children: [new Paragraph("")] }),
            new DocxTableCell({
              children: [new Paragraph(`${summary.percentValid.toFixed(1)}%`)],
            }),
            new DocxTableCell({
              children: [
                new Paragraph(`${summary.percentInvalid.toFixed(1)}%`),
              ],
            }),
            new DocxTableCell({ children: [new Paragraph("")] }),
          ],
        }),
      ];

      // Create the document
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "LAPORAN KEHADIRAN",
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [new TextRun({ text: "STT Payakumbuh", size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Laporan Kehadiran Seluruh Dosen Dan Karyawan STT Payakumbuh",
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Pada Tanggal: ${getPeriodText()}`,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              new DocxTable({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Payakumbuh, ${getSignatureMonth()} ${getSignatureYear()}`,
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [new TextRun({ text: "Mengetahui,", size: 22 })],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({ text: "" }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "(Dr. Zulkifli, S.Kom, M.Kom)",
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "____________________________",
                    size: 22,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          },
        ],
      });

      // Generate and download the document
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Kehadiran_${
        new Date().toISOString().split("T")[0]
      }.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Laporan Word berhasil diunduh");
    } catch (error) {
      console.error("Error generating Word document:", error);
      toast.error("Gagal mengunduh laporan Word");
    }
  };

  return (
    <div className="flex min-h-screens">
      <div className="fixed h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-60">
        <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b">
          <Navbar />
        </div>
        <main className="flex-1 p-6 lg:p-8 pt-20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-start mb-6 pt-17">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Laporan Kehadiran
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {getDescription()}
                </p>
              </div>

              {/* Filter Bar */}
              <div className="space-y-4">
                {/* Filter Bar Atas */}
                <div className="flex items-center justify-end gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama..."
                      className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Filter Bar Bawah */}
                <div className="flex items-center gap-2">
                  {/* Filter Bulan */}
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => {
                      setSelectedMonth(value);
                      setDate(undefined); // Reset date range ketika bulan dipilih
                    }}
                  >
                    <SelectTrigger className="w-[196px]">
                      <SelectValue placeholder="Filter Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      <SelectItem value="1">Januari</SelectItem>
                      <SelectItem value="2">Februari</SelectItem>
                      <SelectItem value="3">Maret</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">Mei</SelectItem>
                      <SelectItem value="6">Juni</SelectItem>
                      <SelectItem value="7">Juli</SelectItem>
                      <SelectItem value="8">Agustus</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">Oktober</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">Desember</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filter Tahun */}
                  <Select
                    value={selectedYear}
                    onValueChange={(value) => {
                      setSelectedYear(value);
                      setDate(undefined); // Reset date range ketika tahun dipilih
                    }}
                  >
                    <SelectTrigger className="w-[196px]">
                      <SelectValue placeholder="Filter Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Range Picker */}
                  <div className="flex items-center gap-2">
                    <DatePickerWithRange
                      date={date}
                      setDate={(newDate) => {
                        setDate(newDate);
                        setSelectedMonth("all"); // Reset bulan ketika date range dipilih
                      }}
                    />
                    {date?.from && (
                      <button
                        onClick={() => setDate(undefined)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Reset periode"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>

                  {/* Download Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="flex items-center gap-2 h-10 px-4 text-white"
                        style={{ backgroundColor: "#8BC34A" }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#689F38")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#8BC34A")
                        }
                      >
                        <FileDown className="h-4 w-4" />
                        Unduh Laporan
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Unduh sebagai PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Unduh sebagai Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadWord}>
                        <Download className="h-4 w-4 mr-2" />
                        Unduh sebagai Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Bidang Kerja</TableHead>
                    <TableHead className="text-center">Valid</TableHead>
                    <TableHead className="text-center">Invalid</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : sortedData.length > 0 ? (
                    sortedData.map((record) => (
                      <TableRow
                        key={record.idUser}
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => handleUserClick(record.idUser)}
                      >
                        <TableCell className="font-medium">
                          {record.namaUser}
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">
                            {record.bidangKerja || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">
                            {record.validCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600 font-medium">
                            {record.invalidCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {record.totalCount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Tidak ada data yang sesuai dengan pencarian
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {sortedData.length > 0 && (
                  <tfoot>
                    <TableRow className="bg-slate-100 dark:bg-slate-800 font-semibold">
                      <TableCell
                        colSpan={2}
                        className="text-right font-bold pr-4"
                      >
                        Persentase Kehadiran
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs text-green-600 font-medium">
                          {summary.percentValid.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-xs text-red-600 font-medium">
                          {summary.percentInvalid.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {/* Kosongkan kolom total */}
                      </TableCell>
                    </TableRow>
                  </tfoot>
                )}
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
