describe('Navbar Component', () => {
    const testEmail = `testuser${Math.floor(Math.random() * 1000000)}@example.com`;
    const testPassword = 'SecurePass123!@';
  
    const signUpAndLogin = () => {
      cy.visit('/signup');
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
      cy.contains('Is employer?').click();
      cy.contains('button', 'Sign Up').click();
      cy.contains('Sign up successful!', { timeout: 10000 }).should('be.visible');
    };
  
    it('should render all main navigation links', () => {
      cy.visit('/');
      cy.contains('Home').should('exist');
      cy.contains('About Us').should('exist');
      cy.contains('For Employers').should('exist');
      cy.contains('Contact Us').should('exist');
      cy.contains('Account').should('exist');
    });
  
    it('should show dropdown options for employers', () => {
      signUpAndLogin();
      cy.visit('/');
      cy.contains('Employer Dashboard').should('exist');
      cy.contains('Posts').should('exist');
      cy.contains('Applicants').should('exist');
    });
  
    it('should navigate correctly through links', () => {
      cy.visit('/');
      cy.contains('Home').click();
      cy.url().should('include', '/');
  
      cy.contains('About Us').click();
      cy.url().should('include', '/about');
  
      cy.contains('For Employers').trigger('mouseover');
      cy.contains('Employer Login').click();
      cy.url().should('include', '/employer-login');
  
      cy.contains('Contact Us').click();
      cy.url().should('include', '/contact');
    });
  
    it('should show "Account" button when not logged in', () => {
      cy.clearCookies();
      cy.visit('/');
      cy.contains('Account').should('exist');
    });
  
    it('should show profile picture after logging in as a job seeker', () => {
      cy.visit('/signup');
      cy.get('input[placeholder="Enter your email"]').type(`jobseeker${Math.floor(Math.random() * 1000000)}@example.com`);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
      cy.contains('button', 'Sign Up').click();
      cy.contains('Sign up successful!', { timeout: 10000 }).should('be.visible');
  
      cy.visit('/');
      cy.get('img[alt="Profile"]').should('exist');
    });
  
    it('should successfully sign out', () => {
      signUpAndLogin();
      cy.visit('/');
      cy.get('img[alt="Profile"]').click();
      cy.contains('Log out').click();
      cy.url().should('include', '/');
      cy.contains('Account').should('exist');
    });
  });
  