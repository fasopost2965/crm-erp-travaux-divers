describe('Dashboard Directeur', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAsRole('directeur');
  });

  it('devrait afficher les indicateurs clés de performance (KPIs)', () => {
    cy.visit('/dashboard');
    
    // Check if the dashboard is loaded
    cy.contains('Tableau de bord').should('be.visible');
    
    // Check KPIs
    cy.contains('Chiffre d\'Affaires').should('be.visible');
    cy.contains('Marge Estimée').should('be.visible');
    cy.contains('Projets Actifs').should('be.visible');
  });

  it('devrait charger les éléments graphiques et la sidebar de navigation', () => {
    cy.visit('/dashboard');
    
    // Check main navigation links in sidebar
    cy.get('aside').should('be.visible');
    cy.get('aside').contains('CRM').should('be.visible');
    cy.get('aside').contains('Devis').should('be.visible');
    cy.get('aside').contains('Chantiers').should('be.visible');
    cy.get('aside').contains('Factures').should('be.visible');
  });
});
