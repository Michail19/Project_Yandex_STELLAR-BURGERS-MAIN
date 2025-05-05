import builderSlice, {
  addBunBuilder,
  addItemBuilder,
  deleteItemBuilder,
  moveItems,
  clearBuilder,
  selectConstructorItems,
  selectBun,
  selectConstructorTotalCount
} from '../builder-slice';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import { v4 as uuidv4 } from 'uuid';

describe('builderSlice', () => {
  const mockBun: TIngredient = {
    _id: 'bun1',
    name: 'Test Bun',
    type: 'bun',
    proteins: 5,
    fat: 5,
    carbohydrates: 5,
    calories: 100,
    price: 100,
    image: 'image.png',
    image_mobile: 'image-mobile.png',
    image_large: 'image-large.png'
  };

  const mockIngredient: TConstructorIngredient = {
    _id: 'ing1',
    name: 'Test Ingredient',
    type: 'sauce',
    proteins: 5,
    fat: 5,
    carbohydrates: 5,
    calories: 50,
    price: 50,
    image: 'image.png',
    image_mobile: 'image-mobile.png',
    image_large: 'image-large.png',
    id: uuidv4()
  };

  it('should return the initial state', () => {
    expect(builderSlice(undefined, { type: '' })).toEqual({
      constructorItems: {
        bun: null,
        ingredients: []
      }
    });
  });

  describe('addBunBuilder', () => {
    it('should add a bun to the constructor', () => {
      const previousState = {
        constructorItems: {
          bun: null,
          ingredients: []
        }
      };

      expect(builderSlice(previousState, addBunBuilder(mockBun))).toEqual({
        constructorItems: {
          bun: mockBun,
          ingredients: []
        }
      });
    });

    it('should replace existing bun when adding a new one', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: []
        }
      };

      const newBun: TIngredient = {
        ...mockBun,
        _id: 'bun2',
        name: 'New Bun'
      };

      expect(builderSlice(previousState, addBunBuilder(newBun))).toEqual({
        constructorItems: {
          bun: newBun,
          ingredients: []
        }
      });
    });

    it('should set bun to null when payload is null', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: []
        }
      };

      expect(builderSlice(previousState, addBunBuilder(null))).toEqual({
        constructorItems: {
          bun: null,
          ingredients: []
        }
      });
    });
  });

  describe('addItemBuilder', () => {
    it('should add an ingredient to the constructor', () => {
      const previousState = {
        constructorItems: {
          bun: null,
          ingredients: []
        }
      };

      const action = addItemBuilder({
        ...mockIngredient,
        id: undefined as unknown as string // Testing the prepare function will add this
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients).toHaveLength(1);
      expect(result.constructorItems.ingredients[0]._id).toBe('ing1');
      expect(result.constructorItems.ingredients[0].id).toBeDefined();
    });

    it('should add a bun via addItemBuilder', () => {
      const previousState = {
        constructorItems: {
          bun: null,
          ingredients: []
        }
      };

      const action = addItemBuilder({
        ...mockBun,
        id: undefined as unknown as string
      });

      const result = builderSlice(previousState, action);

      // Check all properties except the random id
      expect(result.constructorItems.bun).toMatchObject({
        _id: mockBun._id,
        name: mockBun.name,
        type: mockBun.type
        // ... other properties except id
      });
      // @ts-ignore
      expect(result.constructorItems.bun?.id).toBeDefined();
      expect(result.constructorItems.ingredients).toHaveLength(0);
    });

    it('should generate unique id for each ingredient', () => {
      const previousState = {
        constructorItems: {
          bun: null,
          ingredients: []
        }
      };

      const action1 = addItemBuilder({
        ...mockIngredient,
        id: undefined as unknown as string
      });

      const action2 = addItemBuilder({
        ...mockIngredient,
        _id: 'ing2',
        id: undefined as unknown as string
      });

      const state1 = builderSlice(previousState, action1);
      const state2 = builderSlice(state1, action2);

      expect(state2.constructorItems.ingredients).toHaveLength(2);
      expect(state2.constructorItems.ingredients[0].id).not.toBe(
        state2.constructorItems.ingredients[1].id
      );
    });
  });

  describe('deleteItemBuilder', () => {
    it('should delete an ingredient from the constructor', () => {
      const ingredientToDelete = {
        ...mockIngredient,
        id: 'to-delete'
      };

      const ingredientToKeep = {
        ...mockIngredient,
        id: 'to-keep',
        _id: 'ing2'
      };

      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [ingredientToDelete, ingredientToKeep]
        }
      };

      const action = deleteItemBuilder({
        id: 'to-delete',
        type: 'sauce'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients).toHaveLength(1);
      expect(result.constructorItems.ingredients[0].id).toBe('to-keep');
    });

    it('should not delete bun', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: []
        }
      };

      const action = deleteItemBuilder({
        id: 'bun1',
        type: 'bun'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.bun).toEqual(mockBun);
    });
  });

  describe('moveItems', () => {
    const ingredient1 = {
      ...mockIngredient,
      id: '1',
      _id: 'ing1'
    };

    const ingredient2 = {
      ...mockIngredient,
      id: '2',
      _id: 'ing2'
    };

    const ingredient3 = {
      ...mockIngredient,
      id: '3',
      _id: 'ing3'
    };

    it('should move item up', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [ingredient1, ingredient2, ingredient3]
        }
      };

      const action = moveItems({
        index: 1,
        direction: 'up'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients.map((i) => i.id)).toEqual([
        '2',
        '1',
        '3'
      ]);
    });

    it('should move item down', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [ingredient1, ingredient2, ingredient3]
        }
      };

      const action = moveItems({
        index: 1,
        direction: 'down'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients.map((i) => i.id)).toEqual([
        '1',
        '3',
        '2'
      ]);
    });

    it('should not move item up if it is first', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [ingredient1, ingredient2, ingredient3]
        }
      };

      const action = moveItems({
        index: 0,
        direction: 'up'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients.map((i) => i.id)).toEqual([
        '1',
        '2',
        '3'
      ]);
    });

    it('should not move item down if it is last', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [ingredient1, ingredient2, ingredient3]
        }
      };

      const action = moveItems({
        index: 2,
        direction: 'down'
      });

      const result = builderSlice(previousState, action);

      expect(result.constructorItems.ingredients.map((i) => i.id)).toEqual([
        '1',
        '2',
        '3'
      ]);
    });
  });

  describe('clearBuilder', () => {
    it('should clear all items from constructor', () => {
      const previousState = {
        constructorItems: {
          bun: mockBun,
          ingredients: [mockIngredient, mockIngredient]
        }
      };

      const result = builderSlice(previousState, clearBuilder());

      expect(result).toEqual({
        constructorItems: {
          bun: null,
          ingredients: []
        }
      });
    });
  });

  describe('selectors', () => {
    const state = {
      builder: {
        constructorItems: {
          bun: mockBun,
          ingredients: [mockIngredient, mockIngredient]
        }
      }
    };

    it('selectConstructorItems should return all constructor items', () =>
      // @ts-ignore
      expect(selectConstructorItems(state)).toEqual({
        bun: mockBun,
        ingredients: [mockIngredient, mockIngredient]
      }));

    it('selectBun should return the bun', () =>
      // @ts-ignore
      expect(selectBun(state)).toEqual(mockBun));

    it('selectConstructorTotalCount should return the count of ingredients', () =>
      // @ts-ignore
      expect(selectConstructorTotalCount(state)).toBe(2));
  });
});
