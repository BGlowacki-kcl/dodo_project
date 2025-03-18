// cypress/e2e/authform.cy.js

describe('AuthForm Component Tests', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should render sign-up form correctly', () => {
    cy.get('h2').contains('Create Job Seeker Account');
    cy.get('input[placeholder="Enter your email"]').should('exist');
    cy.get('input[placeholder="Enter your password"]').should('exist');
    cy.get('input[placeholder="Confirm your password"]').should('exist');
    cy.get('button[type="submit"]').contains('Sign Up');
  });

  it('should show error for mismatched passwords', () => {
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('Password123');
    cy.get('input[placeholder="Confirm your password"]').type('Password321');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match.').should('exist');
  });

  it('should show error for weak password', () => {
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('weak');
    cy.get('input[placeholder="Confirm your password"]').type('weak');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.').should('exist');
  });

  it('should navigate to sign-in form when link is clicked', () => {
    cy.contains('Already have an account?').siblings('a').click();
    cy.url().should('include', '/signin');
    cy.get('h2').contains('Welcome Back!');
  });

  it('should toggle password visibility', () => {
    cy.get('input[placeholder="Enter your password"]').type('Password123');
    cy.contains('👁️').click();
    cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'text');
  });

  it('should navigate to employer login page', () => {
    cy.contains('Are you an employer? Sign in here').click();
    cy.url().should('include', '/employer-login');
  });

  it('should display loading state when submitting form', () => {
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('Password123');
    cy.get('input[placeholder="Confirm your password"]').type('Password123');
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').contains('Processing...');
  });
});