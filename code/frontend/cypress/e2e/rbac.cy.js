describe('Permissions et Matrice d\'Habilitation (RBAC)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('un commercial ne devrait pas pouvoir accéder aux projets/chantiers', () => {
    cy.loginAsRole('commercial');
    cy.visit('/dashboard/projects');
    cy.url().should('include', '/unauthorized');
    cy.contains('Accès Non Autorisé').should('be.visible');
  });

  it('un chef de chantier ne devrait pas pouvoir accéder aux factures', () => {
    cy.loginAsRole('chef_chantier');
    cy.visit('/dashboard/invoices');
    cy.url().should('include', '/unauthorized');
    cy.contains('Accès Non Autorisé').should('be.visible');
  });

  it('un membre de l\'équipe finance ne devrait pas pouvoir accéder au CRM clients', () => {
    cy.loginAsRole('finance');
    cy.visit('/dashboard/accounts');
    cy.url().should('include', '/unauthorized');
    cy.contains('Accès Non Autorisé').should('be.visible');
  });
});
