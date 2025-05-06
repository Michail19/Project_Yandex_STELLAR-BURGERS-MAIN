describe('Burger Constructor', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('should add an ingredient to the constructor', () => {
    cy.get('[data-test=ingredient-item]').first().trigger('dragstart');
    cy.get('[data-test=drop-container]').trigger('drop');
    cy.get('[data-test=constructor-item]').should('exist');
  });
});
