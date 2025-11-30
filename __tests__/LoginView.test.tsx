import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginView from "../components/LoginView";

// Mock do serviço para não bater no backend real
vi.mock("../services/authService", () => ({
  default: {
    login: vi
      .fn()
      .mockResolvedValue({ id: 1, name: "Tester", email: "test@test.com" }),
  },
}));

describe("Tela de Login", () => {
  it("deve mostrar os campos de email e senha", () => {
    render(<LoginView onLogin={() => {}} />);

    // Verifica se existe um campo input de senha
    // Pega pelo placeholder (ajuste o texto se o seu for diferente de "123")
    expect(screen.getByPlaceholderText(/123/i)).toBeInTheDocument();

    // Verifica o botão
    expect(screen.getByRole("button", { name: /Entrar/i })).toBeInTheDocument();
  });

  it("deve aceitar digitação", () => {
    render(<LoginView onLogin={() => {}} />);

    const emailInput = screen.getByRole("textbox"); // Pega o input de email
    fireEvent.change(emailInput, { target: { value: "teste@email.com" } });

    expect(emailInput).toHaveValue("teste@email.com");
  });
});
