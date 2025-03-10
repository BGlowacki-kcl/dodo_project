const randomNumber = Math.floor(Math.random() * 1000000);
const testEmail = `testuser${randomNumber}@example.com`;
const testPassword = 'SecurePass123!@';

// Helper to sign up or log in
const signUpOrLogin = () => {
  cy.visit('/signup');
  cy.get('input[placeholder="Enter your email"]').type(testEmail);
  cy.get('input[placeholder="Enter your password"]').type(testPassword);
  cy.get('input[placeholder="Confirm your password"]').type(testPassword);
  cy.contains('Is employer?').click();
  cy.contains('button', 'Sign Up').click();

  cy.get('body').then(($body) => {
    if ($body.text().includes('auth/email-already-in-use')) {
      cy.visit('/signin');
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.contains('button', 'Sign In').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
    } else {
      cy.contains('Sign up successful!', { timeout: 10000 }).should('be.visible');
      cy.url({ timeout: 10000 }).should('include', '/addDetails');
    }
  });
};

describe('Swiping Page Tests', () => {
  beforeEach(() => {
    signUpOrLogin();
    cy.visit('/swipe');
    cy.url({ timeout: 10000 }).should('include', '/swipe');
  });

  it('should render the swiping page interface', () => {
    cy.contains('Filter Job Type', { timeout: 10000 }).should('be.visible');
  });

  it('should swipe right (like) a job', () => {
    cy.get('.job-card').first().should('exist').trigger('dragstart');
    cy.get('.swipe-right-area').trigger('drop');
    cy.contains('Job liked!', { timeout: 5000 }).should('be.visible');
  });

  it('should swipe left (dislike) a job', () => {
    cy.get('.job-card').first().should('exist').trigger('dragstart');
    cy.get('.swipe-left-area').trigger('drop');
    cy.contains('Job disliked!', { timeout: 5000 }).should('be.visible');
  });

  it('should show message when no more jobs are available', () => {
    cy.get('.job-card').each(() => {
      cy.get('.swipe-right-area').trigger('drop');
    });
    cy.contains('No job recommendations available.', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to job details when card is clicked', () => {
    cy.get('.job-card').first().click();
    cy.url().should('include', '/job-details');
    cy.contains('Job Details', { timeout: 10000 }).should('be.visible');
  });
});
