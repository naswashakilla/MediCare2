"use client";

export function ExportWordButton({ fileName }: { fileName: string }) {
  function exportWord() {
    const area = document.getElementById("area-laporan");
    if (!area) return;

    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Laporan Pendaftaran Pasien</title>
<style>
  @page { size: A4 landscape; margin: 2cm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 2px; text-align: center; }
  h2 { font-size: 13px; margin: 0 0 12px; text-align: center; font-weight: normal; }
  p { margin: 2px 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #333; padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #e2e8f0; }
  .muted { color: #444; font-size: 10px; }
</style>
</head>
<body>
${area.innerHTML}
</body>
</html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportWord}
      className="rounded-xl border border-iced-denim/20 bg-frost px-4 py-2.5 font-semibold text-iced-denim-dark transition hover:border-iced-denim/40 hover:bg-white"
    >
      Ekspor Word (.doc)
    </button>
  );
}
