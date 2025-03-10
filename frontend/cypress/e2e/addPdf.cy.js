const randomNumber = Math.floor(Math.random() * 1000000);
const testEmail = `testuser${randomNumber}@example.com`;
const testPassword = 'SecurePass123!@';

// Helper to sign up or log in and navigate to addDetails
const signUpAndVisitAddDetails = () => {
  cy.visit('/signup');
  cy.get('input[placeholder="Enter your email"]').type(testEmail);
  cy.get('input[placeholder="Enter your password"]').type(testPassword);
  cy.get('input[placeholder="Confirm your password"]').type(testPassword);
  cy.contains('Is employer?').click();
  cy.contains('button', 'Sign Up').click();

  cy.get('body').then(($body) => {
    if ($body.text().includes('auth/email-already-in-use')) {
      // If the user already exists, sign in instead
      cy.visit('/signin');
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.contains('button', 'Sign In').click();
    } else {
      cy.contains('Sign up successful! Please complete your profile.', { timeout: 15000 }).should('be.visible');
    }
  });

  // Navigate to Add Details page after authentication
  cy.url({ timeout: 15000 }).should('include', '/addDetails');
};

describe('PDF Upload in Add Details Page', () => {
  beforeEach(() => {
    signUpAndVisitAddDetails();
  });

  it('should render the initial upload interface', () => {
    cy.contains('Complete Your Profile', { timeout: 15000 }).should('be.visible');
    cy.contains('Choose a PDF File', { timeout: 15000 }).should('be.visible');
  });

  it('should display loading state during file upload', () => {
    const fileName = 'sample_resume.pdf';
    cy.get('input[type="file"]', { timeout: 15000 }).selectFile(`cypress/fixtures/${fileName}`, { force: true });
    cy.contains('Loading...', { timeout: 15000 }).should('be.visible');
  });

  it('should render parsed data after uploading a valid PDF', () => {
    const fileName = 'sample_resume.pdf';
    cy.get('input[type="file"]', { timeout: 15000 }).selectFile(`cypress/fixtures/${fileName}`, { force: true });
    cy.contains('Loading...', { timeout: 15000 }).should('be.visible');
    cy.contains('Parsed Data', { timeout: 15000 }).should('be.visible');
  });

  it('should show an error if the uploaded file is invalid', () => {
    const fileName = 'invalid_file.txt';
    cy.get('input[type="file"]', { timeout: 15000 }).selectFile(`cypress/fixtures/${fileName}`, { force: true });
    cy.contains('Error:', { timeout: 15000 }).should('be.visible');
  });
});
