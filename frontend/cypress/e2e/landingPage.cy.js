describe('JOBORITHM Landing Page', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/job/count/type?type=Internship', { count: 43 }).as('getInternshipCount');
      cy.intercept('GET', '/api/job/count/type?type=Placement', { count: 40 }).as('getPlacementCount');
      cy.intercept('GET', '/api/job/count/type?type=Graduate', { count: 32 }).as('getGraduateCount');
      cy.intercept('GET', '/api/job/roles', ['Developer', 'Analyst']).as('getRoles');
      cy.intercept('GET', '/api/job/locations', ['New York', 'London']).as('getLocations');
      cy.intercept('GET', '/api/job/employmentType', ['Full-Time', 'Graduate', 'Internship', 'Part-Time', 'Placement']).as('getTypes');
      cy.intercept('GET', '/api/job/search*', []).as('getSearchResults');
  
      cy.visit('http://localhost:5174/');
      cy.contains('JOBORITHM', { timeout: 10000 }).should('be.visible');
      cy.wait(['@getInternshipCount', '@getPlacementCount', '@getGraduateCount', '@getRoles', '@getLocations', '@getTypes']);
    });
  
    it('renders the landing page with correct elements', () => {
      cy.contains('JOBORITHM').should('be.visible');
      cy.contains('Find what you\'re looking for:').should('be.visible');
      cy.contains('label', 'Job Type').parent().find('input').should('have.attr', 'placeholder', 'Select a Job Type...').and('be.visible');
      cy.contains('label', 'Role').parent().find('input').should('have.attr', 'placeholder', 'Select a Role...').and('be.visible');
      cy.contains('label', 'Location').parent().find('input').should('have.attr', 'placeholder', 'Select a Location...').and('be.visible');
      cy.get('button').contains('Search').should('be.visible');
      cy.contains('Internships').should('be.visible');
      cy.contains('43').should('be.visible');
      cy.contains('Placements').should('be.visible');
      cy.contains('40').should('be.visible');
      cy.contains('Graduate').should('be.visible');
      cy.contains('32').should('be.visible');
    });
  
    it('allows selecting options in dropdowns and clicking Search', () => {
      // Focus and type to open Job Type dropdown
      cy.contains('label', 'Job Type')
        .parent()
        .find('input')
        .focus()
        .type('i'); // Type a character to ensure the dropdown opens
      // Wait for the dropdown and select an option
      cy.get('ul.absolute.z-10.bg-primary', { timeout: 5000 })
        .should('be.visible')
        .find('li')
        .contains('Internship')
        .click();
      cy.contains('label', 'Job Type')
        .parent()
        .find('input')
        .should('have.value', 'Internship');
  
      // Focus and type to open Role dropdown
      cy.contains('label', 'Role')
        .parent()
        .find('input')
        .focus()
        .type('d');
      cy.get('ul.absolute.z-10.bg-primary', { timeout: 5000 })
        .should('be.visible')
        .find('li')
        .contains('Developer')
        .click();
      cy.contains('label', 'Role')
        .parent()
        .find('input')
        .should('have.value', 'Developer');
  
      // Focus and type to open Location dropdown
      cy.contains('label', 'Location')
        .parent()
        .find('input')
        .focus()
        .type('n');
      cy.get('ul.absolute.z-10.bg-primary', { timeout: 5000 })
        .should('be.visible')
        .find('li')
        .contains('New York')
        .click();
      cy.contains('label', 'Location')
        .parent()
        .find('input')
        .should('have.value', 'New York');
  
      // Click the Search button
      cy.get('button').contains('Search').click();
  
      // Verify navigation to search results
      cy.url().should('include', '/search-results?jobType=Internship&role=Developer&location=New+York');
      cy.wait('@getSearchResults');
    });
  
    it('verifies job cards are clickable', () => {
      cy.contains('Internships').click();
      cy.url().should('include', '/search-results?jobType=Internship');
      cy.visit('http://localhost:5174/');
      cy.contains('Placements').click();
      cy.url().should('include', '/search-results?jobType=Placement');
      cy.visit('http://localhost:5174/');
      cy.contains('Graduate').click();
      cy.url().should('include', '/search-results?jobType=Graduate');
    });
  });