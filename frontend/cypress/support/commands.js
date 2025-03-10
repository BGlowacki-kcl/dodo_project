Cypress.Commands.add('login', (email, password) => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/signin',
      body: {
        email,
        password,
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 404) {
        // User doesn't exist, register first
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/api/auth/signup',
          body: {
            email,
            password,
          },
        }).then((signupResponse) => {
          if (signupResponse.body.token) {
            window.localStorage.setItem('authToken', signupResponse.body.token);
          } else {
            throw new Error('Signup failed. No token received.');
          }
        });
      } else if (response.body.token) {
        window.localStorage.setItem('authToken', response.body.token);
      } else {
        throw new Error('Login failed. No token received.');
      }
    });
  });
  