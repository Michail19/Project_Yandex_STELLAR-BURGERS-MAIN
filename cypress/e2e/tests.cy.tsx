describe('Функциональность конструктора бургеров', () => {
  beforeEach(() => {
    cy.fixture('ingredients.json');
    cy.fixture('orders.json');
    cy.fixture('user.json');
    cy.fixture('makeOrder.json');

    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', 'api/auth/user', { fixture: 'user.json' }).as('user');
    cy.intercept('GET', 'api/orders/all', { fixture: 'orders.json' }).as('orders');
    cy.intercept('POST', 'api/orders', { fixture: 'makeOrder.json' }).as('newOrder');

    // Перехват getUser нужно переместить сюда
    cy.fixture('user.json').then((user) => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: user,
      }).as('getUser');
    });

    cy.setCookie('accessToken', 'mockToken');
    localStorage.setItem('refreshToken', 'mockToken');

    cy.visit('/');
  });

  it('Перехват запросов API', () => {
    cy.wait('@getIngredients').its('response.statusCode').should('eq', 200);
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });

  it('Авторизация пользователя и проверка профиля', () => {
    cy.visit('/profile');
    cy.wait('@getUser');
    cy.get(`[data-cy='profile-name']`, { timeout: 10000 }).should('have.value', 'User');
  });

  it('Нет булки при старте', () => {
    cy.get(`[data-cy='constructor-module']`).should(
      'not.contain.text',
      'просто какая-то булка'
    );
  });

  it('Добавление булки в конструктор', () => {
    cy.get(`[data-cy='ingredients-module']`)
      .first()
      .children()
      .last()
      .find('button')
      .click();

    cy.get(`[data-cy='constructor-module']`).should(
      'contain.text',
      'Флюоресцентная булка R2-D3'
    );
  });

  it('Добавление начинки в конструктор', () => {
    cy.get(`[data-cy='ingredients-module']`)
      .eq(2) // Третья секция — начинки
      .children()
      .first()
      .find('button')
      .click();

    cy.get(`[data-cy='constructor-module']`).should(
      'contain.text',
      'Биокотлета из марсианской Магнолии'
    );
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    cy.get(`[data-cy='ingredients-module']`).first().children().last().find('button').click();
    cy.get(`[data-cy='ingredients-module']`).eq(2).children().first().find('button').click();
    cy.get(`[data-cy='ingredients-module']`).last().children().last().find('button').click();

    cy.get(`[data-cy='constructor-module']`).children().last().find('button').click();

    cy.wait('@newOrder').its('response.statusCode').should('eq', 200);

    cy.get(`[data-cy='modal']`).should('be.visible');
    cy.get(`[data-cy='modal']`).find('button').click();

    cy.get(`[data-cy='constructor-module']`).within(() => {
      cy.contains('Выберите булки');
      cy.contains('Выберите начинку');
    });
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    cy.contains('Краторная булка').click();
    cy.get(`[data-cy='modal']`).should('be.visible');
    cy.get(`[data-cy='modal']`).find('button').click();
    cy.get(`[data-cy='modal']`).should('not.exist');
  });

  it('Закрытие модального окна клавишей Esc', () => {
    cy.contains('Краторная булка').click();
    cy.get('body').type('{esc}');
    cy.get(`[data-cy='modal']`).should('not.exist');
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains('Краторная булка').click();
    cy.get(`[data-cy='modalOverlay']`).click('top', { force: true });
    cy.get(`[data-cy='modal']`).should('not.exist');
  });
});
