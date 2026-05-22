describe('Parcours Utilisateur : Suivi de Chantier (Chef de Chantier)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAsRole('chef_chantier');
  });

  it('devrait charger le tableau de bord chef de chantier et lister les projets affectés', () => {
    cy.visit('/dashboard');
    cy.contains('Suivi de Chantier & Opérations').should('be.visible');
    cy.contains('Chantiers Actifs').should('be.visible');
    cy.contains('Heures Validées').should('be.visible');
    
    // Visit projects list
    cy.get('aside').contains('Chantiers').click();
    cy.url().should('include', '/dashboard/projects');
    cy.contains('Gestion des Projets & Chantiers').should('be.visible');
  });

  it('devrait afficher la fiche détail d\'un projet avec ses onglets', () => {
    cy.visit('/dashboard/projects');
    
    // Click on the first project if exists
    cy.get('table tbody tr').first().click();
    cy.url().should('match', /\/dashboard\/projects\/\d+/);
    
    // Check tabs
    cy.contains('Fiche').should('be.visible');
    cy.contains('Tâches (Kanban)').should('be.visible');
    cy.contains('Heures').should('be.visible');
    cy.contains('Photos & Docs').should('be.visible');
    cy.contains('Signatures PV').should('be.visible');
  });
});
