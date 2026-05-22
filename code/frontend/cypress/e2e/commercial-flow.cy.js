describe('Parcours Utilisateur : Commercial Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAsRole('commercial');
  });

  it('devrait accéder au dashboard commercial et naviguer dans les modules', () => {
    cy.visit('/dashboard');
    cy.contains('Tableau de Bord Commercial').should('be.visible');
    cy.contains('Pipeline Opportunités').should('be.visible');
    
    // Visit CRM Clients
    cy.get('aside').contains('CRM').click();
    cy.url().should('include', '/dashboard/accounts');
    cy.contains('Répertoire Client (CRM)').should('be.visible');
    
    // Verify client list has elements
    cy.get('table').should('exist');
  });

  it('devrait consulter la liste des devis et accéder à la création d\'un devis', () => {
    cy.visit('/dashboard/quotes');
    cy.contains('Registre des Devis').should('be.visible');
    
    // Check search and filter
    cy.get('input[placeholder*="Rechercher"]').should('exist');
    
    // Click Créer devis
    cy.get('button').contains('Créer un Devis').click();
    cy.url().should('include', '/dashboard/quotes/new');
    cy.contains('Nouveau Devis Client').should('be.visible');
  });
});
