describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/ingredients', { fixture: 'ingredients.json' });
    cy.intercept('POST', '**/orders', { fixture: 'order-response.json' });
    cy.visit('/');
  });

  it('Позволяет собирать бургер и оформлять заказ', () => {
    // Перетаскиваем булку
    cy.get('[data-cy="ingredient-Kраторная булка N-200i"]').trigger('dragstart');
    cy.get('[data-cy="constructor-drop"]').trigger('drop');

    // Перетаскиваем начинку
    cy.get('[data-cy="ingredient-Биокотлета из марсианской Магнолии"]').trigger('dragstart');
    cy.get('[data-cy="constructor-drop"]').trigger('drop');

    // Проверяем, что ингредиенты отображаются в конструкторе
    cy.get('[data-cy="constructor-bun-top"]').should('contain', 'Краторная булка N-200i');
    cy.get('[data-cy="constructor-bun-bottom"]').should('contain', 'Краторная булка N-200i');
    cy.get('[data-cy="constructor-main"]').should('contain', 'Биокотлета из марсианской Магнолии');

    // Нажимаем на кнопку "Оформить заказ"
    cy.contains('Оформить заказ').click();

    // Проверяем, что отображается номер заказа
    cy.contains('40763').should('be.visible');
  });
});
