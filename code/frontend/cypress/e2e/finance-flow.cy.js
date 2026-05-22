describe('Parcours Utilisateur : Administration Financière (Finance)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAsRole('finance');
  });

  it('devrait charger le tableau de bord financier et lister les factures', () => {
    cy.visit('/dashboard');
    cy.contains('Trésorerie & Recouvrement').should('be.visible');
    cy.contains('Encaissé Ce Mois').should('be.visible');
    cy.contains('Créances Impayées').should('be.visible');
    
    // Visit invoices list
    cy.get('aside').contains('Factures').click();
    cy.url().should('include', '/dashboard/invoices');
    cy.contains('Factures & Trésorerie').should('be.visible');
  });

  it('devrait afficher la fiche détail d\'une facture et les actions de règlement', () => {
    cy.visit('/dashboard/invoices');
    
    // Click first invoice
    cy.get('table tbody tr').first().click();
    cy.url().should('match', /\/dashboard\/invoices\/\d+/);
    
    cy.contains('Fiche Facture :').should('be.visible');
    cy.contains('État de Trésorerie').should('be.visible');
    cy.contains('Historique des encaissements').should('be.visible');
  });
});
