const randomNumber = Math.floor(Math.random() * 1000000);
const testEmail = `testuser${randomNumber}@example.com`;
const testPassword = 'SecurePass123!@';

// Helper to sign up or sign in and navigate to addDetails
const signUpOrSignIn = () => {
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
    } else {
      cy.contains('Sign up successful! Please complete your profile.', { timeout: 10000 }).should('be.visible');
    }
  });

  // Navigate to Add Details page after authentication
  cy.visit('/addDetails');
};

describe('Add Details Page', () => {
  beforeEach(() => {
    signUpOrSignIn();
  });

  it('should render the Add Details form', () => {
    cy.contains('Complete Your Profile', { timeout: 10000 }).should('be.visible');
    cy.contains('Choose a PDF File').should('be.visible');
  });

  it('should allow manual entry and submission of details', () => {
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="location"]').type('New York');
    cy.get('input[name="phone"]').type('1234567890');
    cy.get('input[name="linkedin"]').type('linkedin.com/johndoe');
    cy.get('input[name="github"]').type('github.com/johndoe');
    cy.get('input[name="portfolio"]').type('johndoe.com');

    cy.contains('button', 'Complete Profile').click();
    cy.contains('Profile completed successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should allow uploading and autofilling from resume', () => {
    const fileName = 'sample_resume.pdf';
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
    cy.contains('Loading...').should('be.visible');
    cy.contains('Parsed Data', { timeout: 10000 }).should('be.visible');
  });

  it('should display an error for invalid PDF upload', () => {
    const fileName = 'invalid_file.txt';
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
    cy.contains('Error:', { timeout: 10000 }).should('be.visible');
  });
});
