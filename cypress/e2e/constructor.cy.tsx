describe('Конструктор бургеров', () => {
  beforeEach(() => {
    // Загружаем фикстуры
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('orders.json').as('orderData');
    cy.fixture('user.json').as('userData');

    // Мокируем API
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', 'api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', 'api/orders', { fixture: 'makeOrder.json' }).as('createOrder');

    // Настраиваем авторизацию
    cy.setCookie('accessToken', 'test-access-token');
    cy.window().then(win => {
      win.localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    cy.visit('/');

    // Ожидаем загрузки критических данных
    cy.wait('@getIngredients').its('response.statusCode').should('eq', 200);
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });

  it('Добавление ингредиентов и оформление заказа', () => {
    // 1. Проверяем загрузку ингредиентов
    cy.get('[data-cy="ingredients-module"]').should('exist');

    // 2. Добавляем булку
    cy.get('[data-cy="ingredient-Краторная булка N-200i"]')
      .should('exist')
      .trigger('dragstart');
    cy.get('[data-cy="constructor-module"]').trigger('drop');

    // Проверяем добавление булки
    cy.get('[data-cy="constructor-bun-top"]')
      .should('contain', 'Краторная булка N-200i');
    cy.get('[data-cy="constructor-bun-bottom"]')
      .should('contain', 'Краторная булка N-200i');

    // 3. Добавляем начинку
    cy.get('[data-cy="ingredient-Биокотлета из марсианской Магнолии"]')
      .should('exist')
      .trigger('dragstart');
    cy.get('[data-cy="constructor-module"]').trigger('drop');

    // Проверяем добавление начинки
    cy.get('[data-cy="constructor-main"]')
      .should('contain', 'Биокотлета из марсианской Магнолии');

    // 4. Оформляем заказ
    cy.get('[data-cy="order-button"]')
      .should('be.enabled')
      .click();

    // Проверяем модальное окно с номером заказа
    cy.wait('@createOrder').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="order-number"]').should('contain', '40763');

    // 5. Закрываем модальное окно
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="modal"]').should('not.exist');
  });
});
