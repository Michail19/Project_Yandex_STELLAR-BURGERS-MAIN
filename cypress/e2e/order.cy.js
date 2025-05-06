describe('Order Creation', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', '**/api/orders', { fixture: 'order-response.json' }).as('createOrder');

    window.localStorage.setItem('accessToken', 'mockAccessToken');
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('creates order and clears constructor', () => {
    // Добавляем булку
    cy.get('[data-test=ingredient-bun]').first().trigger('dragstart');
    cy.get('[data-test=drop-container]').trigger('drop');

    // Добавляем начинку
    cy.get('[data-test=ingredient-filling]').first().trigger('dragstart');
    cy.get('[data-test=drop-container]').trigger('drop');

    // Оформляем заказ
    cy.get('[data-test=order-button]').click();
    cy.wait('@createOrder');

    // Проверяем модалку с номером заказа
    cy.get('[data-test=order-modal]').should('contain', 'номер заказа');
    cy.get('[data-test=order-number]').should('contain', '40761');

    // Закрываем модалку
    cy.get('[data-test=modal-close]').click();
    cy.get('[data-test=order-modal]').should('not.exist');

    // Проверяем, что конструктор пуст
    cy.get('[data-test=constructor-item]').should('not.exist');
  });
});
