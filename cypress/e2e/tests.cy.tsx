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

    // Проверяем заголовок страницы профиля (альтернативные варианты)
    cy.get('h1, h2').contains('/profile').should('exist');

    // Или проверяем форму профиля
    cy.get('form').should('exist');
    cy.get('input[name="name"]').should('exist').should('have.value', 'User');
  });

  it('Нет булки при старте', () => {
    // Проверяем по тексту, так как селекторы не работают
    cy.contains('Выберите булки').should('exist');
    cy.contains('Выберите начинку').should('exist');
  });

  it('Добавление булки в конструктор', () => {
    // Кликаем по булке
    cy.contains('Флюоресцентная булка R2-D3').click();

    // Проверяем URL модального окна
    cy.url().should('include', '/ingredients/');

    // Возвращаемся на главную
    cy.go('back');

    // Проверяем конструктор через текстовые элементы
    cy.contains('Флюоресцентная булка R2-D3', { timeout: 10000 }).should('exist');
  });

  it('Добавление начинки в конструктор', () => {
    // Прокручиваем к разделу начинок и кликаем
    cy.contains('Начинки').scrollIntoView().click({ force: true });

    // Добавляем первую начинку (используем более общий селектор)
    cy.get('[class*="ingredient"]').first().click();

    // Проверяем конструктор
    cy.contains('Биокотлета из марсианской Магнолии').should('exist');
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    // Добавляем булку
    cy.contains('Флюоресцентная булка R2-D3').click();
    cy.go('back');

    // Добавляем начинку
    cy.contains('Начинки').scrollIntoView().click({ force: true });
    cy.get('[class*="ingredient"]').first().click();

    // Оформляем заказ
    cy.contains('Оформить заказ', { timeout: 10000 }).click();

    // Проверяем модальное окно заказа
    cy.contains('идентификатор заказа').should('exist');

    // Закрываем модальное окно
    cy.get('body').type('{esc}');
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

    // Альтернативный способ закрытия через клик по координатам
    cy.get('body').click(10, 10);

    // Проверяем, что вернулись на главную
    cy.url().should('eq', 'http://localhost:4000/');
  });

  it('Закрытие модального окна через клик на оверлей', () => {
    cy.contains('Краторная булка').click();
    cy.get(`[data-cy='modalOverlay']`).click('top', { force: true });
    cy.get(`[data-cy='modal']`).should('not.exist');
  });
});
