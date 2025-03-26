describe('Navbar Component', () => {
    // Utility function to set session storage
    const setSessionStorage = (token, role) => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('token', token || '');
        win.sessionStorage.setItem('role', role || '');
        win.dispatchEvent(new Event('authChange')); // Trigger authChange
      });
    };
  
    // Setup before each test
    beforeEach(() => {
      cy.visit('/'); // Visit the base route
    });
  
    // Clear session storage after each test
    afterEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });
    });
  
    // Test 1: Guest User (Not Logged In)
    describe('Guest User (Not Logged In)', () => {
      it('displays the correct links for a guest user', () => {
        cy.get('nav.bg-white.shadow-md').should('be.visible');
        cy.get('img[src="/joborithmLogo.png"]').should('be.visible').and('have.attr', 'alt', 'Logo');
  
        // Left-side navigation links
        cy.get('nav .container ul').first().within(() => {
          cy.contains('Home').should('have.attr', 'href', '/');
          cy.contains('All Jobs').should('have.attr', 'href', '/search-results');
          cy.contains('Contact Us').should('have.attr', 'href', '/contact');
        });
  
        // Right-side auth links
        cy.get('nav .container ul').last().within(() => {
          cy.contains('Sign Up').should('have.attr', 'href', '/signup');
          cy.contains('Login').should('have.attr', 'href', '/signin');
        });
  
        // Ensure other links are not present
        cy.contains('Dashboard').should('not.exist');
        cy.contains('Swipe Jobs').should('not.exist');
        cy.contains('Log Out').should('not.exist');
      });
    });
  
    // Test 2: Logged-In Job Seeker (Non-Employer)
    describe('Logged-In Job Seeker', () => {
      beforeEach(() => {
        setSessionStorage('fake-token', 'jobSeeker');
        cy.reload(); // Reload to trigger useEffect
      });
  
      it('displays the correct links for a logged-in job seeker', () => {
        // Left-side navigation links
        cy.get('nav .container ul').first().within(() => {
          cy.contains('Home').should('have.attr', 'href', '/');
          cy.contains('All Jobs').should('have.attr', 'href', '/search-results');
          cy.contains('Swipe Jobs').should('have.attr', 'href', '/swipe');
          cy.contains('Contact Us').should('have.attr', 'href', '/contact');
        });
  
        // Right-side user menu
        cy.get('nav .container ul').last().within(() => {
          cy.contains('Dashboard').should('have.attr', 'href', '/applicant-dashboard');
          cy.contains('Log Out').should('be.visible');
        });
  
        cy.contains('Posts').should('not.exist');
      });
  
      it('handles logout correctly', () => {
        // Click navbar Log Out to open modal
        cy.get('nav .container ul').last().contains('Log Out').click();
        cy.get('.bg-white.rounded-lg').should('be.visible'); // Check modal appears
  
        // Click Log Out in the modal
        cy.get('.bg-white.rounded-lg').contains('button', 'Log Out').click();
  
        // Simulate authService.signOut effects
        cy.window().then((win) => {
          win.sessionStorage.clear();
          win.dispatchEvent(new Event('authChange'));
        });
  
        // Verify logout
        cy.window().its('sessionStorage').should('not.have.property', 'token');
        cy.window().its('sessionStorage').should('not.have.property', 'role');
        cy.url().should('eq', 'http://localhost:5173/');
        cy.get('.bg-white.rounded-lg').should('not.exist'); // Modal should close
      });
    });
  
    // Test 3: Logged-In Employer
    describe('Logged-In Employer', () => {
      beforeEach(() => {
        setSessionStorage('fake-token', 'employer');
        cy.reload(); // Reload to trigger useEffect
      });
  
      it('displays the correct links for a logged-in employer', () => {
        // Left-side navigation links
        cy.get('nav .container ul').first().within(() => {
          cy.contains('Posts').should('have.attr', 'href', '/employer/posts');
          cy.contains('Dashboard').should('have.attr', 'href', '/employer-dashboard');
          cy.contains('Contact Us').should('have.attr', 'href', '/contact');
        });
  
        // Right-side user menu
        cy.get('nav .container ul').last().within(() => {
          cy.contains('Log Out').should('be.visible');
        });
  
        cy.contains('Swipe Jobs').should('not.exist');
        cy.contains('All Jobs').should('not.exist');
      });
  
      it('handles logout correctly', () => {
        // Click navbar Log Out to open modal
        cy.get('nav .container ul').last().contains('Log Out').click();
        cy.get('.bg-white.rounded-lg').should('be.visible'); // Check modal appears
  
        // Click Log Out in the modal
        cy.get('.bg-white.rounded-lg').contains('button', 'Log Out').click();
  
        // Simulate authService.signOut effects
        cy.window().then((win) => {
          win.sessionStorage.clear();
          win.dispatchEvent(new Event('authChange'));
        });
  
        // Verify logout
        cy.window().its('sessionStorage').should('not.have.property', 'token');
        cy.window().its('sessionStorage').should('not.have.property', 'role');
        cy.url().should('eq', 'http://localhost:5173/');
        cy.get('.bg-white.rounded-lg').should('not.exist'); // Modal should close
      });
    });
  
    // Test 4: Navigation
    it('navigates to the correct route when clicking a link', () => {
      cy.contains('Home').click();
      cy.url().should('eq', 'http://localhost:5173/');
  
      setSessionStorage('fake-token', 'jobSeeker');
      cy.reload();
      cy.contains('Swipe Jobs').click();
      cy.url().should('eq', 'http://localhost:5173/swipe');
    });
  });