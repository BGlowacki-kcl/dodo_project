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
    // Type a password
    cy.get('input[placeholder="Enter your password"]').type('Password123');

    // Debug the DOM to find the toggle element
    cy.get('input[placeholder="Enter your password"]').parent().then(($parent) => {
      cy.log('Password input parent:', $parent[0].outerHTML);
    });

    // Try to find the toggle button/icon near the password input
    // Assuming the toggle is a button or span with a class like 'toggle-password' or 'eye-icon'
    cy.get('input[placeholder="Enter your password"]').parent()
      .find('[class*="toggle"], [class*="eye"], button, span', { timeout: 10000 })
      .should('exist')
      .click();

    // Verify the input type changes to 'text'
    cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'text');

    // Toggle back to password (optional, to test both directions)
    cy.get('input[placeholder="Enter your password"]').parent()
      .find('[class*="toggle"], [class*="eye"], button, span')
      .click();
    cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'password');
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