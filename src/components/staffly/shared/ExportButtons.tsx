"use client";

import * as React from "react";
import { FileSpreadsheet, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Excel export (SheetJS). Rows are plain objects keyed by column header.
export function ExcelExportButton({
  filename,
  sheetName = "Staffly",
  rows,
  label = "Excel",
}: {
  filename: string;
  sheetName?: string;
  rows: Record<string, string | number>[];
  label?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy || rows.length === 0}
      onClick={async () => {
        setBusy(true);
        try {
          const XLSX = await import("xlsx");
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
          XLSX.writeFile(wb, filename);
        } catch {
          toast.error("Couldn't export to Excel.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <FileSpreadsheet className="size-4" /> {label}
    </Button>
  );
}

// PDF export (jsPDF + html2canvas) of an element, with a Staffly header.
export function PdfExportButton({
  targetId,
  filename,
  title,
  subtitle,
  label = "PDF",
}: {
  targetId: string;
  filename: string;
  title: string;
  subtitle?: string;
  label?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={async () => {
        const el = document.getElementById(targetId);
        if (!el) return;
        setBusy(true);
        try {
          const [{ default: html2canvas }, jspdf] = await Promise.all([
            import("html2canvas"),
            import("jspdf"),
          ]);
          const canvas = await html2canvas(el, {
            backgroundColor: "#ffffff",
            scale: 2,
          });
          const { jsPDF } = jspdf;
          const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
          const pageW = pdf.internal.pageSize.getWidth();
          const margin = 32;

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.setTextColor(15, 28, 46);
          pdf.text(`Staffly — ${title}`, margin, 38);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(100, 116, 139);
          pdf.text(
            `${subtitle ? subtitle + " · " : ""}Exported ${new Date().toLocaleDateString("en-GB")}`,
            margin,
            54,
          );

          const imgW = pageW - margin * 2;
          const imgH = (canvas.height / canvas.width) * imgW;
          pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            margin,
            68,
            imgW,
            imgH,
          );
          pdf.save(filename);
        } catch {
          toast.error("Couldn't export to PDF.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <FileDown className="size-4" /> {label}
    </Button>
  );
}
