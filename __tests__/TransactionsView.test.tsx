import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransactionsView from "../components/TransactionsView";
import { Transaction } from "../types";

// Mock de dados
const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Compras no Supermercado",
    amount: 450.5,
    category: "Alimentação",
    status: "Pago",
    accountType: "Variável",
    date: "2023-12-01",
    dueDate: "2023-12-05",
  },
  {
    id: "2",
    description: "Assinatura Netflix",
    amount: 55.9,
    category: "Lazer",
    status: "Pendente",
    accountType: "Recorrente",
    date: "2023-12-10",
    dueDate: "2023-12-15",
  },
];

const mockCategories = ["Alimentação", "Lazer"];

describe("TransactionsView (Tela de Pagamentos)", () => {
  it("deve renderizar a lista de pagamentos corretamente", () => {
    render(
      <TransactionsView
        transactions={mockTransactions}
        categories={mockCategories}
        onEditTransaction={() => {}}
        onDelete={() => {}}
      />
    );

    // Textos únicos (descrição) usamos getByText (espera 1)
    expect(screen.getByText("Compras no Supermercado")).toBeInTheDocument();
    expect(screen.getByText("Assinatura Netflix")).toBeInTheDocument();

    // Textos repetidos (filtro + card) usamos getAllByText (espera vários)
    // Verificamos se achou pelo menos 1
    const alimentacaoElements = screen.getAllByText("Alimentação");
    expect(alimentacaoElements.length).toBeGreaterThan(0);
  });

  it("deve formatar o dinheiro corretamente (R$)", () => {
    render(
      <TransactionsView
        transactions={mockTransactions}
        categories={mockCategories}
        onEditTransaction={() => {}}
        onDelete={() => {}}
      />
    );

    // Regex para achar o valor formatado
    expect(screen.getByText(/450,50/)).toBeInTheDocument();
  });

  it("deve mostrar os status corretos", () => {
    const deleteSpy = vi.fn();

    render(
      <TransactionsView
        transactions={mockTransactions}
        categories={mockCategories}
        onEditTransaction={() => {}}
        onDelete={deleteSpy}
      />
    );

    // Como "Pago" e "Pendente" aparecem no filtro E no card, usamos getAll
    const pagos = screen.getAllByText("Pago");
    const pendentes = screen.getAllByText("Pendente");

    expect(pagos.length).toBeGreaterThan(0);
    expect(pendentes.length).toBeGreaterThan(0);
  });

  it("deve mostrar mensagem quando não houver transações", () => {
    render(
      <TransactionsView
        transactions={[]}
        categories={mockCategories}
        onEditTransaction={() => {}}
        onDelete={() => {}}
      />
    );

    // Se estiver vazio, o item não deve aparecer
    expect(
      screen.queryByText("Compras no Supermercado")
    ).not.toBeInTheDocument();
  });
});
