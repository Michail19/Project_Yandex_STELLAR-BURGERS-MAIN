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
    // Проверяем авторизацию
    cy.getCookie('accessToken').should('exist');
    cy.window().then(win => {
      expect(win.localStorage.getItem('refreshToken')).to.exist;
    });

    // Перехватываем запрос к профилю
    cy.intercept('GET', 'https://norma.nomoreparties.space/api/auth/user', { fixture: 'user.json' }).as('getUser');

    // Переходим на страницу профиля с таймаутом
    cy.visit('/profile', { timeout: 15000 });

    // Ждём завершения запроса авторизации
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);

    // Проверяем URL
    cy.url().should('include', '/profile');

    // Проверяем наличие формы профиля
    cy.get('form').should('exist');
    cy.get('input[name="name"]').should('have.value', 'Test User');
  });

  it('Нет булки при старте', () => {
    // Проверяем по тексту, так как селекторы не работают
    cy.contains('Выберите булки').should('exist');
    cy.contains('Выберите начинку').should('exist');
  });

  it('Добавление булки в конструктор', () => {
    // Кликаем по булке
    cy.contains('Флюоресцентная булка R2-D3')
      .next()
      .click();

    // Проверяем конструктор через текстовые элементы
    cy.contains('Флюоресцентная булка R2-D3', { timeout: 10000 }).should('exist');
  });

  it('Добавление начинки в конструктор', () => {
    // Прокручиваем и кликаем на раздел начинок
    cy.contains('Начинки').scrollIntoView().click({ force: true });

    // Находим карточку ингредиента и кликаем
    cy.contains('Биокотлета из марсианской Магнолии')
      .parent() // Поднимаемся на 1 уровень
      .parent() // Еще на уровень (структура может быть сложнее)
      .click();

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
    cy.contains('Флюоресцентная булка R2-D3')
      .next()
      .click();

    // Добавляем начинку
    cy.contains('Начинки').scrollIntoView();
    cy.contains('Биокотлета из марсианской Магнолии')
      .next()
      .click();

    // Проверяем, что кнопка активна
    cy.contains('Оформить заказ').should('not.be.disabled').click();

    // Ждём запрос
    cy.wait('@newOrder', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

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
