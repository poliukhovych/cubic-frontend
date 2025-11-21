import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/** Експортує DOM-вузол як A4 landscape PDF (масштаб підганяється) */
export async function exportSchedulePdf(el: HTMLElement, filename = "schedule.pdf", title?: string) {
  await new Promise(r => setTimeout(r, 50)); // дати DOM устаканитись
  const canvas = await html2canvas(el, {
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--surface") || "#fff",
    scale: 2,
    useCORS: true,
  });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pw / canvas.width, ph / canvas.height);
  const w = canvas.width * ratio, h = canvas.height * ratio;
  const x = (pw - w) / 2, y = (ph - h) / 2;
  if (title) { pdf.setFontSize(12); pdf.text(title, 24, 24); }
  pdf.addImage(img, "PNG", x, y, w, h);
  pdf.save(filename);
}
