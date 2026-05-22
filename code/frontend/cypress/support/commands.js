Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsRole', (role) => {
  const users = {
    directeur: { email: 'admin@travaux.ma', password: 'password' },
    commercial: { email: 'commercial@travaux.ma', password: 'password' },
    chef_chantier: { email: 'khalid@travaux.ma', password: 'password' },
    finance: { email: 'finance@travaux.ma', password: 'password' }
  };
  cy.login(users[role].email, users[role].password);
});
