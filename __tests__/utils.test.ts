import { describe, it, expect } from "vitest";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

describe("Testes de Utilitários (Matemática)", () => {
  it("deve formatar 1000 reais corretamente", () => {
    const valor = 1000;
    const resultado = formatCurrency(valor);
    expect(resultado).toContain("1.000,00");
  });

  it("deve calcular soma de contas", () => {
    const luz = 100;
    const agua = 50;
    expect(luz + agua).toBe(150);
  });
});
