// cypress/e2e/employerPosts.cy.js

describe('Employer Posts Page Tests', () => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    const testEmail = `employer${randomNumber}@example.com`;
    const testPassword = 'SecurePass123!';
  
    const signUpEmployer = () => {
      cy.visit('/signup');
      cy.get('input[placeholder="Enter your email"]').type(testEmail);
      cy.get('input[placeholder="Enter your password"]').type(testPassword);
      cy.get('input[placeholder="Confirm your password"]').type(testPassword);
      cy.contains('Is employer?').click();
      cy.contains('button', 'Sign Up').click();
      cy.contains('Sign up successful!', { timeout: 10000 }).should('be.visible');
    };
  
    beforeEach(() => {
      signUpEmployer();
      cy.visit('/posts');
    });
  
    it('should render the Employer Posts page correctly', () => {
      cy.contains('Employer Posts').should('be.visible');
    });
  
    it('should display job posts if available', () => {
      cy.get('.job-post').should('exist');
    });
  
    it('should navigate to Create New Post page', () => {
      cy.contains('Create New Post').click();
      cy.url().should('include', '/posts/new');
    });
  
    it('should navigate to Edit Post page when edit button is clicked', () => {
      cy.get('.edit-button').first().click();
      cy.url().should('include', '/posts/edit');
    });
  
    it('should delete a post when delete button is clicked', () => {
      cy.get('.delete-button').first().click();
      cy.contains('Post deleted successfully').should('be.visible');
    });
  
    it('should display a message if no posts are available', () => {
      cy.get('.delete-button').click({ multiple: true });
      cy.contains('No Posts Available').should('be.visible');
    });
  });