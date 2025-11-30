describe("Fluxo Completo do Sistema", () => {
  beforeEach(() => {
    // Força tela grande
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173");
  });

  it("Deve fazer login e criar um pagamento com sucesso", () => {
    // --- 1. LOGIN ---
    cy.get('input[type="email"]').type("admin@alecrim.com");
    cy.get('input[type="password"]').type("123");
    cy.contains("button", "Entrar").click();

    // --- 2. NAVEGAÇÃO ---
    cy.contains("Painel", { timeout: 15000 }).should("be.visible");
    cy.get("nav").contains("Pagamentos").click();
    cy.contains("Meus Pagamentos", { timeout: 10000 }).should("be.visible");

    // --- 3. ABRIR MODAL ---
    cy.contains("button", "Novo").click();
    cy.contains("Adicionar Novo Pagamento").should("be.visible");

    // --- 4. PREENCHER FORMULÁRIO ---
    cy.get('input[placeholder*="Ex: Aluguel"]').type("Teste do Robô Full HD");

    // Valor
    cy.get('input[type="number"]').first().type("300.00");

    // [CORREÇÃO AQUI]
    // Adicionei { force: true } para obrigar o clique mesmo se o input estiver atrapalhando
    cy.get("select")
      .contains("Alimentação")
      .parent()
      .select("Lazer", { force: true });

    // --- 5. SALVAR ---
    cy.contains("button", "Adicionar").click();

    // --- 6. PROVA REAL ---
    cy.contains("Adicionar Novo Pagamento").should("not.exist");
    cy.contains("Teste do Robô Full HD").should("be.visible");
    cy.contains("R$ 300,00").should("be.visible");
  });
});
