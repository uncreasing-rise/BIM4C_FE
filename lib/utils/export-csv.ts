/**
 * Utility to export tabular data to UTF-8 CSV format with BOM for full Vietnamese support in Excel.
 */

export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; header: string; format?: (row: T) => string }[],
) {
  if (!rows || rows.length === 0) {
    throw new Error("Không có dữ liệu để xuất");
  }

  // Header row
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");

  // Data rows
  const dataRows = rows.map((row) =>
    columns
      .map((col) => {
        let value = "";
        if (col.format) {
          value = col.format(row);
        } else {
          const raw = row[col.key as keyof T];
          value = raw === null || raw === undefined ? "" : String(raw);
        }
        return `"${value.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
      })
      .join(","),
  );

  // UTF-8 BOM (\uFEFF) ensures Excel displays Vietnamese correctly
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
