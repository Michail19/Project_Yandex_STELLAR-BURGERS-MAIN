describe('Ingredient Modal', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('opens and closes modal by close button and overlay click', () => {
    cy.get('[data-test=ingredient-item]').first().click();
    cy.get('[data-test=modal]').should('exist');

    // Клик на крестик
    cy.get('[data-test=modal-close]').click();
    cy.get('[data-test=modal]').should('not.exist');

    // Клик на оверлей
    cy.get('[data-test=ingredient-item]').first().click();
    cy.get('[data-test=modal-overlay]').click('topRight');
    cy.get('[data-test=modal]').should('not.exist');
  });
});
