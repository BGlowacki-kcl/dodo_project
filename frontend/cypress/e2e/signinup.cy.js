describe('Authentication Flow', () => {
    it('should log in the user successfully', () => {
      cy.visit('http://localhost:5173/signin');
  
      cy.get('input[placeholder="Enter your email"]').type('testingbg12@email.com');
      cy.get('input[placeholder="Enter your password"]').type('Password123');
      cy.get('button').contains('Sign In').click();
  
      cy.url().should('include', '/dashboard');
    });
  });
  