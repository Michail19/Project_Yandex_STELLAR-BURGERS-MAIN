describe('Функциональность конструктора бургеров', () => {
  beforeEach(() => {
    // Убедитесь, что фикстуры загружаются перед использованием
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('user.json').as('userData');

    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', 'api/auth/user', { fixture: 'user.json' }).as('getUser');

    cy.setCookie('accessToken', 'mockToken');
    localStorage.setItem('refreshToken', 'mockToken');

    cy.visit('/');
    cy.wait('@getIngredients'); // Дождитесь загрузки ингредиентов
    cy.contains('Соберите бургер').should('exist');
  });

  it('Перехват запросов API', () => {
    cy.wait('@getIngredients').its('response.statusCode').should('eq', 200);
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });

  it('Авторизация пользователя и проверка профиля', () => {
    cy.visit('/profile');
    cy.wait('@getUser');

    // Добавим проверку загрузки страницы профиля
    cy.contains('Профиль').should('exist');

    // Альтернативные селекторы для полей профиля
    cy.get('input').first().should('exist').should('have.value', 'User');

    // Или ищем по placeholder
    cy.get('input[placeholder="Имя"]').should('exist').should('have.value', 'User');
  });

  it('Нет булки при старте', () => {
    // Проверяем по тексту, так как селекторы не работают
    cy.contains('Выберите булки').should('exist');
    cy.contains('Выберите начинку').should('exist');
  });

  it('Добавление булки в конструктор', () => {
    // Кликаем по булке (двойной клик для добавления)
    cy.contains('Флюоресцентная булка R2-D3').dblclick();

    // Проверяем конструктор
    cy.get('[class*="constructor-element"]').first()
      .should('contain', 'Флюоресцентная булка R2-D3');
  });

  it('Добавление начинки в конструктор', () => {
    // Находим раздел начинок
    cy.contains('Начинки').should('exist');

    // Кликаем по первой начинке
    cy.contains('Начинки').parent()
      .next()
      .find('[class*="ingredient-card"]')
      .first()
      .click();

    // Проверяем конструктор
    cy.get('[class*="constructor-element"]')
      .should('contain', 'Биокотлета из марсианской Магнолии');
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    // Добавляем булку
    cy.contains('Флюоресцентная булка R2-D3').dblclick();

    // Добавляем начинку
    cy.contains('Начинки').parent()
      .next()
      .find('[class*="ingredient-card"]')
      .first()
      .click();

    // Нажимаем кнопку оформления заказа
    cy.contains('Оформить заказ').click();

    // Проверяем модальное окно заказа
    cy.contains('идентификатор заказа').should('exist');

    // Закрываем модальное окно
    cy.get('button').contains('×').click();
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    cy.contains('Краторная булка').click();

    // Проверяем URL модального окна
    cy.url().should('include', '/ingredients/');

    // Альтернативный способ закрытия
    cy.get('body').type('{esc}');
    cy.url().should('eq', 'http://localhost:4000/');
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains('Краторная булка').click();
    cy.url().should('include', '/ingredients/');

    // Кликаем по оверлею через координаты
    cy.get('body').click(10, 10);
    cy.url().should('eq', 'http://localhost:4000/');
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains('Краторная булка').click();
    cy.get(`[data-cy='modalOverlay']`).click('top', { force: true });
    cy.get(`[data-cy='modal']`).should('not.exist');
  });
});
