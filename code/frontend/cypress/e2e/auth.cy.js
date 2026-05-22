describe('Authentification et Protection des Routes', () => {
  beforeEach(() => {
    // Clear local storage and cookies
    cy.clearLocalStorage();
    cy.clearAllCookies?.();
  });

  it('devrait rediriger vers /login si non authentifié lors de l\'accès au dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('devrait échouer avec des identifiants invalides', () => {
    cy.visit('/login');
    cy.get('input[id="email"]').type('invalide@atlasworks.ma');
    cy.get('input[id="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Deberait afficher une notification ou un message d'erreur
    cy.contains('Identifiants incorrects.').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('devrait réussir à se connecter avec des identifiants valides et se déconnecter', () => {
    cy.loginAsRole('directeur');
    cy.url().should('include', '/dashboard');
    
    // Logout
    cy.get('button').contains('Déconnexion').click({ force: true });
    cy.url().should('include', '/login');
  });
});
