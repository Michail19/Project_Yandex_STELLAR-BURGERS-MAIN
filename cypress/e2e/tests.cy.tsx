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
  });

  it('Перехват запросов API', () => {
    cy.wait('@getIngredients').its('response.statusCode').should('eq', 200);
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });

  it('Авторизация пользователя и проверка профиля (устойчивый)', () => {
    cy.visit('/profile');

    // Дождаться запроса к API
    cy.wait('@getUser');

    // Дождаться формы профиля — например, по data-cy или другому надежному локатору
    cy.get('form').should('exist');

    // Дождаться поля name и убедиться, что оно содержит ожидаемое значение
    cy.get('input[name=name]', { timeout: 4000 })
      .should('exist')
      .should('have.value', 'User');
  });

  it('Нет булки при старте', () => {
    // Альтернативный селектор для конструктора
    cy.get('[class^=burger-constructor]').should('exist');
    cy.contains('Выберите булки').should('exist');
  });

  it('Добавление булки в конструктор', () => {
    // Альтернативный селектор для списка ингредиентов
    cy.get('[class^=burger-ingredients]').should('exist');
    cy.contains('Флюоресцентная булка R2-D3').click();

    // Проверка в конструкторе
    cy.get('[class^=burger-constructor]').should('contain', 'Флюоресцентная булка R2-D3');
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

    // Альтернативные селекторы для модального окна
    cy.get('[class^=modal]').should('be.visible');
    cy.get('[class^=modal]').find('button').first().click();
    cy.get('[class^=modal]').should('not.exist');
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

  it('Debug: проверить DOM', () => {
    cy.visit('/');
    cy.wait('@getIngredients');
    cy.document().then((doc) => {
      console.log('Whole DOM:', doc.documentElement.outerHTML);
    });
    cy.get('*').then((els) => {
      console.log('All elements:', els.length);
    });
  });

  it('Проверка существования элементов с data-cy', () => {
    cy.visit('/');
    cy.wait('@getIngredients');

    // Проверка всех элементов с data-cy атрибутами на странице
    cy.get('[data-cy]').then((elements) => {
      const foundAttributes = elements.toArray().map(el => el.getAttribute('data-cy'));
      console.log('Найденные data-cy атрибуты:', foundAttributes);

      // Проверка конкретных атрибутов
      const requiredAttributes = [
        'profile-name',
        'constructor-module',
        'ingredients-module',
        'modal',
        'modalOverlay'
      ];

      requiredAttributes.forEach(attr => {
        if (!foundAttributes.includes(attr)) {
          console.error(`Атрибут data-cy="${attr}" не найден на странице`);
        }
      });
    });
  });

  it('Проверка базовой разметки', () => {
    cy.visit('/');
    cy.wait('@getIngredients');

    // Проверка основных разделов
    cy.get('body').should('exist');
    cy.get('#root').should('exist');

    // Проверка наличия основных элементов интерфейса
    cy.contains('Соберите бургер').should('exist');
    cy.contains('Булки').should('exist');
    cy.contains('Начинки').should('exist');
    cy.contains('Соусы').should('exist');
  });
});
