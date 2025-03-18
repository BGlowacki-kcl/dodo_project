describe('Forbidden Page', () => {

    beforeEach(() => {
      // Visit the Forbidden page directly or simulate an unauthorized access
      cy.visit('/forbidden'); // Change to the URL where the Forbidden page is routed
    });
  
    it('should display the correct title and message', () => {
      cy.contains('Ooops...!').should('exist');
      cy.contains('This page is forbidden, how did you get here?').should('exist');
    });
  
    it('should display the "Go back!" button', () => {
      cy.get('button')
        .should('have.text', 'Go back!')
        .and('have.class', 'border-2 rounded-lg h-10 w-32 hover:bg-gray-800 hover:text-white bg-gray-400 mr-10');
    });
  
    it('should go back to the previous page when "Go back!" is clicked', () => {
      cy.get('button').click();
      
      // Assuming you were previously on another page, this should go back.
      cy.url().should('not.include', '/forbidden'); // Ensure the user navigated away from forbidden page
    });
  
    it('should display the warning image', () => {
      cy.get('img[alt="Url forbidden"]')
        .should('exist')
        .and('have.class', 'w-1/4 h-auto');
    });
  
  });
  