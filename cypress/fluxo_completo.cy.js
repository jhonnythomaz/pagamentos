describe("Fluxo Completo do Sistema", () => {
  // Antes de cada teste, acessa o site
  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("Deve fazer login e criar um pagamento com sucesso", () => {
    // 1. LOGIN
    // O robô procura o input de email e digita
    cy.get('input[type="email"]').type("admin@alecrim.com");
    cy.get('input[type="password"]').type("123");

    // Clica no botão Entrar
    cy.contains("button", "Entrar").click();

    // 2. VERIFICAÇÃO DE LOGIN
    // Espera até encontrar a palavra "Painel" ou "Meus Pagamentos"
    // Isso garante que mudou de tela
    cy.contains("Meus Pagamentos", { timeout: 10000 }).should("be.visible");

    // 3. ABRIR MODAL
    cy.contains("button", "Novo").click();
    cy.contains("Adicionar Novo Pagamento").should("be.visible");

    // 4. PREENCHER FORMULÁRIO
    // Usamos seletores inteligentes para achar os campos

    // Descrição (buscando pelo placeholder ou label próxima seria o ideal, aqui vamos pelo type)
    // Se o seu input tiver placeholder="Ex: Aluguel...", usamos ele:
    cy.get('input[placeholder*="Ex: Aluguel"]').type("Teste do Robô Cypress");

    // Valor
    cy.get('input[placeholder="0,00"]').type("150.50");

    // Categoria (Select)
    // O Cypress seleciona pelo valor ou texto
    // Vamos pegar o select que tem "Alimentação" e mudar para "Lazer"
    cy.get("select").contains("Alimentação").parent().select("Lazer");

    // 5. SALVAR
    cy.contains("button", "Adicionar").click();

    // 6. VALIDAÇÃO FINAL (A PROVA REAL)
    // Verifica se o modal fechou (não deve existir o texto Adicionar Novo Pagamento)
    cy.contains("Adicionar Novo Pagamento").should("not.exist");

    // Verifica se o item apareceu na lista
    cy.contains("Teste do Robô Cypress").should("be.visible");
    cy.contains("R$ 150,50").should("be.visible");
  });
});
