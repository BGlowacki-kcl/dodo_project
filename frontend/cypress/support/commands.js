// ***********************************************
// Custom Commands
// ***********************************************

Cypress.Commands.add('login', (email = 'test@example.com', password = 'test123') => {
    cy.session([email, password], () => {
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(email);
        cy.get('[data-cy="password-input"]').type(password);
        cy.get('[data-cy="login-button"]').click();
        cy.url().should('include', '/dashboard');
    });
});

// Command to mock recommended jobs
Cypress.Commands.add('mockRecommendedJobs', (jobs = []) => {
    cy.intercept('GET', '/api/matcher/recommend-jobs', {
        body: { recommendedJobs: jobs }
    }).as('getRecommendedJobs');
});

// Command to mock shortlist
Cypress.Commands.add('mockShortlist', (shortlisted = []) => {
    cy.intercept('GET', '/api/shortlist', {
        body: { jobs: shortlisted }
    }).as('getShortlist');
});

// ***********************************************
// Overwrite existing commands
// ***********************************************

// Example of overwriting visit to always wait for React to load
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
    return originalFn(url, {
        ...options,
        onBeforeLoad: (win) => {
            options && options.onBeforeLoad && options.onBeforeLoad(win);
            win.addEventListener('ReactLoaded', () => {});
        }
    });
});