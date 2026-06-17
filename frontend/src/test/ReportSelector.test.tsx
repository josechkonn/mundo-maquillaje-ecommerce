import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReportSelector from "../components/admin/reports/ReportSelector";

describe("ReportSelector", () => {
  it("renders the selected report label", () => {
    render(<ReportSelector value="sales" onChange={() => {}} />);
    expect(screen.getByText("Ventas")).toBeDefined();
  });

  it("renders placeholder when no report selected", () => {
    render(<ReportSelector value="" onChange={() => {}} />);
    expect(screen.getByText("Seleccionar reporte...")).toBeDefined();
  });

  it("opens dropdown on click", () => {
    render(<ReportSelector value="sales" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Stock / Inventario")).toBeDefined();
  });

  it("calls onChange when an option is clicked", () => {
    const onChange = vi.fn();
    render(<ReportSelector value="sales" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Pedidos"));
    expect(onChange).toHaveBeenCalledWith("orders");
  });

  it("closes dropdown after selection", () => {
    render(<ReportSelector value="sales" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Clientes"));
    expect(screen.queryByText("Más Vendidos")).toBeNull();
  });

  it("renders all 8 report options in dropdown", () => {
    render(<ReportSelector value="sales" onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByText("Ventas").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Stock / Inventario")).toBeDefined();
    expect(screen.getByText("Pedidos")).toBeDefined();
    expect(screen.getByText("Clientes")).toBeDefined();
    expect(screen.getByText("Más Vendidos")).toBeDefined();
    expect(screen.getByText("Ingresos por Categoría")).toBeDefined();
    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Conversión")).toBeDefined();
  });
});
