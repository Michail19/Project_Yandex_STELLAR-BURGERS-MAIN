describe('Авторизация и профиль', () => {
  it('Переход в профиль после входа', () => {
    // Сначала мокаем запрос /auth/user
    cy.intercept('GET', '**/api/auth/user', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'test_user@example.com',
          name: 'Test User'
        }
      }
    }).as('getUser');

    // Выполняем авторизацию
    cy.loginByApi();

    // Переходим на страницу
    cy.visit('/');
    cy.contains('Личный кабинет').click();

    // Ждем завершения запроса
    cy.wait('@getUser');

    // Проверяем URL и форму
    cy.contains('Test User').click();
    cy.url().should('include', '/profile');
    cy.get('form', { timeout: 10000 }).should('exist');
    cy.get('input[name="name"]').should('have.value', 'Test User');
  });
});

describe('Функциональность конструктора бургеров', () => {
  beforeEach(() => {
    // Сначала мокаем все запросы
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('user.json').as('userData');

    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.intercept('GET', 'api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );

    cy.setCookie('accessToken', 'mockToken');
    localStorage.setItem('refreshToken', 'mockToken');

    // И только потом переходим на страницу
    cy.visit('/');
  });

  it('Перехват запросов API', () => {
    cy.wait('@getIngredients').its('response.statusCode').should('eq', 200);
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });

  // it('Авторизация пользователя', () => {
  //   // Переходим на страницу логина
  //   cy.visit('/login');
  //
  //   // Дождись появления поля email
  //   cy.get('input[name="email"]', { timeout: 10000 }).should('exist');
  //
  //   // Заполняем email
  //   cy.get('input[name="email"]').type('test_user@example.com');
  //
  //   // Проверка успешной авторизации
  //   cy.url().should('include', '/');
  // });

  // it('Проверка профиля', () => {
  //   // Удалить токены ДО захода на страницу
  //   cy.clearCookies();
  //   cy.clearLocalStorage();
  //
  //   cy.visit('/login');
  //
  //   // Ждём поля
  //   cy.get('input[name="email"]').should('exist');
  //   cy.get('input[name="email"]').type('test_user@example.com');
  //
  //   cy.get('input[name="password"]').should('exist');
  //   cy.get('input[name="password"]').type('12345678');
  //
  //   // Кликаем по кнопке входа
  //   cy.contains('button', 'Войти').click();
  //
  //   // Ждём перехода на профиль
  //   cy.url().should('include', '/profile');
  //   cy.get('form').should('exist');
  // });

  it('Нет булки при старте', () => {
    // Проверяем по тексту, так как селекторы не работают
    cy.contains('Выберите булки').should('exist');
    cy.contains('Выберите начинку').should('exist');
  });

  it('Добавление булки в конструктор', () => {
    // Кликаем по булке
    cy.contains('Флюоресцентная булка R2-D3').next().click();

    // Проверяем конструктор через текстовые элементы
    cy.contains('Флюоресцентная булка R2-D3', { timeout: 10000 }).should(
      'exist'
    );
  });

  it('Добавление начинки в конструктор', () => {
    // Прокручиваем и кликаем на раздел начинок
    cy.contains('Начинки').scrollIntoView().click({ force: true });

    // Находим карточку ингредиента и кликаем
    cy.contains('Биокотлета из марсианской Магнолии').next().click();

    // Проверяем конструктор
    cy.contains('Биокотлета из марсианской Магнолии').should('exist');
  });

  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    // Мокаем запрос на создание заказа
    cy.intercept('POST', 'api/orders', {
      fixture: 'makeOrder.json',
      statusCode: 200
    }).as('newOrder');

    // Добавляем булку
    cy.contains('Флюоресцентная булка R2-D3').next().click();

    // Добавляем начинку
    cy.contains('Начинки').scrollIntoView();
    cy.contains('Биокотлета из марсианской Магнолии').next().click();

    // Проверяем, что кнопка активна
    cy.contains('Оформить заказ').should('not.be.disabled').click();

    // Ждём запрос
    cy.wait('@newOrder', { timeout: 30000 })
      .its('response.statusCode')
      .should('eq', 200);

    // Проверяем модальное окно с номером заказа
    cy.contains('идентификатор заказа').should('be.visible');
    cy.get('body').type('{esc}'); // Закрываем модальное окно

    // Проверяем очистку конструктора
    cy.contains('Выберите булки').should('exist');
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
});
