const randomNumber = Math.floor(Math.random() * 1000000);
const testEmail = `testuser${randomNumber}@example.com`;
const testPassword = 'SecurePass123!@';

// Helper function to sign up or sign in
const authenticateUser = () => {
  cy.visit('/signup');
  cy.get('input[placeholder="Enter your email"]').type(testEmail);
  cy.get('input[placeholder="Enter your password"]').type(testPassword);
  cy.get('input[placeholder="Confirm your password"]').type(testPassword);
  cy.contains('Is employer?').click();
  cy.contains('button', 'Sign Up').click();

  cy.get('body').then(($body) => {
    if ($body.text().includes('auth/email-already-in-use')) {
      // If the email already exists, sign in instead
      cy.visit('/signin');
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.contains('button', 'Sign In').click();
    } else {
      // Wait for the sign-up success message
      cy.contains('Sign up successful! Please complete your profile.', { timeout: 15000 }).should('be.visible');
    }
  });
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    authenticateUser();
    cy.visit('/dashboard');
  });

  it('should render the dashboard correctly', () => {
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('should sign out and redirect to the home page', () => {
    cy.contains('button', 'Sign Out', { timeout: 10000 }).should('be.visible').click();
    cy.url({ timeout: 10000 }).should('include', '/');
    cy.contains('Sign In', { timeout: 10000 }).should('be.visible');
  });
});
