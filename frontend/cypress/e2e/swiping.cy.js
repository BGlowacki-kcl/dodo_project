describe('Job Swiping Functionality', () => {
    beforeEach(() => {
        // Mock API responses and login
        cy.login(); // Custom command you'll need to create
        cy.intercept('GET', '/api/matcher/recommend-jobs', {
            fixture: 'recommendedJobs.json' // Create this fixture
        }).as('getRecommendedJobs');
        cy.intercept('POST', '/api/shortlist/*').as('shortlistJob');

        cy.visit('/swiping');
        cy.wait('@getRecommendedJobs');
    });

    it('should display job cards correctly', () => {
        // Verify job card elements
        cy.get('[data-cy="swipe-box"]').should('be.visible');
        cy.get('[data-cy="job-title"]').should('be.visible');
        cy.get('[data-cy="company-name"]').should('be.visible');
        cy.get('[data-cy="job-description"]').should('be.visible');
        cy.get('[data-cy="skip-btn"]').should('be.visible');
        cy.get('[data-cy="shortlist-btn"]').should('be.visible');
    });

    it('should allow skipping a job', () => {
        cy.get('[data-cy="skip-btn"]').click();

        // Verify animation and next job loads
        cy.get('[data-cy="swipe-box"]')
            .should('have.class', 'translate-x-48') // Match your skip animation class
            .should('not.exist'); // After animation completes

        // Verify new job loads
        cy.get('[data-cy="swipe-box"]').should('be.visible');
    });

    it('should allow shortlisting a job', () => {
        cy.get('[data-cy="shortlist-btn"]').click();
        cy.wait('@shortlistJob').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        // Verify animation and next job loads
        cy.get('[data-cy="swipe-box"]')
            .should('have.class', '-translate-x-48') // Match your shortlist animation class
            .should('not.exist'); // After animation completes

        // Verify new job loads
        cy.get('[data-cy="swipe-box"]').should('be.visible');
    });

    it('should support keyboard shortcuts for swiping', () => {
        // Left arrow to skip
        cy.get('body').type('{leftarrow}');
        cy.get('[data-cy="swipe-box"]')
            .should('have.class', 'translate-x-48');

        // Right arrow to shortlist
        cy.get('body').type('{rightarrow}');
        cy.get('[data-cy="swipe-box"]')
            .should('have.class', '-translate-x-48');
    });

    it('should handle no more jobs available', () => {
        // Mock empty response after initial jobs
        cy.intercept('GET', '/api/matcher/recommend-jobs', {
            body: { recommendedJobs: [] }
        }).as('getEmptyJobs');

        // Skip all initial jobs
        Cypress._.times(5, () => {
            cy.get('[data-cy="skip-btn"]').click();
            cy.wait(500); // Wait for animation
        });

        // Verify empty state
        cy.contains('No job recommendations available').should('be.visible');
    });

    it('should persist skipped jobs and not show them again', () => {
        // Get initial job ID
        cy.get('[data-cy="swipe-box"]').invoke('attr', 'data-job-id').then((initialJobId) => {
            // Skip the job
            cy.get('[data-cy="skip-btn"]').click();

            // Verify the same job doesn't reappear
            cy.get('[data-cy="swipe-box"]').should('not.have.attr', 'data-job-id', initialJobId);
        });
    });
});