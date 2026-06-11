import { describe, it, expect, vi } from "vitest";

// Mock xlsx entirely
vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({ Sheets: {}, SheetNames: [] })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

import { exportToExcel } from "../lib/exportToExcel";
import * as XLSX from "xlsx";

describe("exportToExcel", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls json_to_sheet with data", () => {
    const data = [{ name: "Test", value: 123 }];
    exportToExcel(data, "Reporte_Stock");

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(data);
  });

  it("creates a new workbook", () => {
    exportToExcel([{ a: 1 }], "Test");
    expect(XLSX.utils.book_new).toHaveBeenCalled();
  });

  it("appends sheet with default name 'Reporte'", () => {
    exportToExcel([{ a: 1 }], "Test");
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "Reporte"
    );
  });

  it("accepts custom sheet name", () => {
    exportToExcel([{ a: 1 }], "Test", "CustomSheet");
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "CustomSheet"
    );
  });

  it("writes file with correct filename pattern", () => {
    exportToExcel([{ a: 1 }], "Reporte_Stock");
    const filename = vi.mocked(XLSX.writeFile).mock.calls[0][1];
    expect(filename).toMatch(/^Reporte_Stock_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it("handles empty array", () => {
    expect(() => exportToExcel([], "Empty")).not.toThrow();
  });
});
