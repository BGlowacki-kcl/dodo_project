describe('Authentication Flow', () => {

    const testEmail = `testuser${Date.now()}@example.com`;
    const testPassword = 'Test1234!';
  
    beforeEach(() => {
      cy.visit('/signin');
    });
  
    it('should successfully sign up a new user', () => {
      cy.visit('/signup');
  
      // Fill in sign-up form
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
  
      // Check the 'Is employer' checkbox
      cy.contains('Is employer?').click();
  
      // Submit the form
      cy.contains('button', 'Sign Up').click();
  
      // Verify notification or redirection
      cy.contains('Sign up successful! Please complete your profile.').should('exist');
    });
  
    it('should show error for weak passwords during signup', () => {
      cy.visit('/signup');
  
      cy.get('input[placeholder="Enter your email"]').type('weakpass@example.com');
      cy.get('input[placeholder="Enter your password"]').type('weak');
      cy.get('input[placeholder="Confirm your password"]').type('weak');
      
      cy.contains('button', 'Sign Up').click();
  
      cy.contains('Password must be at least 8 characters').should('exist');
    });
  
    it('should display error if passwords do not match during signup', () => {
      cy.visit('/signup');
  
      cy.get('input[placeholder="Enter your email"]').type('mismatch@example.com');
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type('Mismatch123');
  
      cy.contains('button', 'Sign Up').click();
  
      cy.contains('Passwords do not match.').should('exist');
    });
  
    it('should successfully sign in an existing user', () => {
      cy.visit('/signin');
  
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      
      cy.contains('button', 'Sign In').click();
  
      cy.contains('Sign in successful!').should('exist');
    });
  
    it('should show error for incorrect credentials', () => {
      cy.visit('/signin');
  
      cy.get('input[placeholder="Enter your email"]').type('wronguser@example.com');
      cy.get('input[placeholder="Enter your password"]').type('WrongPassword1!');
      
      cy.contains('button', 'Sign In').click();
  
      cy.contains('Sign in failed. Please check your email and password.').should('exist');
    });
  
    it('should toggle password visibility', () => {
      cy.visit('/signup');
  
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      
      // Password should be hidden initially
      cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'password');
  
      // Click the toggle button to show password
      cy.contains('👁️').click();
      cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'text');
  
      // Toggle it back to hidden
      cy.contains('🙈').click();
      cy.get('input[placeholder="Enter your password"]').should('have.attr', 'type', 'password');
    });
  
  });
  