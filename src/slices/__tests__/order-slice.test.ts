import { configureStore } from '@reduxjs/toolkit';
import orderSlice, {
  createOrder,
  fetchOrderNumber,
  fetchOrder,
  orderDataSelector,
  selectOrders,
  selectOrderRequest,
  selectOrderModalData,
  closeOrderModalData,
  IOrderState,
  initialState
} from '../order-slice';
import { orderBurgerApi, getOrderByNumberApi, getOrdersApi } from '@api';
import { TOrder } from '@utils-types';

// Моки для API
jest.mock('@api', () => ({
  orderBurgerApi: jest.fn(),
  getOrderByNumberApi: jest.fn(),
  getOrdersApi: jest.fn()
}));

const mockedOrderBurgerApi = orderBurgerApi as jest.MockedFunction<typeof orderBurgerApi>;
const mockedGetOrderByNumberApi = getOrderByNumberApi as jest.MockedFunction<typeof getOrderByNumberApi>;
const mockedGetOrdersApi = getOrdersApi as jest.MockedFunction<typeof getOrdersApi>;

describe('order slice', () => {
  const mockOrder: TOrder = {
    _id: '1',
    ingredients: ['ing1', 'ing2'],
    status: 'done',
    name: 'Order 1',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    number: 1
  };

  const mockOrders: TOrder[] = [
    mockOrder,
    {
      _id: '2',
      ingredients: ['ing3', 'ing4'],
      status: 'pending',
      name: 'Order 2',
      createdAt: '2023-01-02',
      updatedAt: '2023-01-02',
      number: 2
    }
  ];

  const mockApiResponse = {
    success: true,
    orders: [mockOrder],
    name: 'Order 1'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(orderSlice(undefined, { type: 'unknown' })).toEqual({
      order: [],
      orderRequest: false,
      orderError: null,
      orderModalData: null,
      isLoadingNumber: true,
      isLoadingOrder: true
    });
  });

  describe('actions', () => {
    it('should handle closeOrderModalData', () => {
      const initialStateWithModal: IOrderState = {
        ...initialState,
        orderModalData: mockOrder,
        orderRequest: true
      };

      const action = closeOrderModalData();
      const state = orderSlice(initialStateWithModal, action);

      expect(state.orderModalData).toBeNull();
      expect(state.orderRequest).toBe(false);
    });
  });

  describe('async thunks', () => {
    describe('createOrder', () => {
      it('should handle pending', () => {
        const action = { type: createOrder.pending.type };
        const state = orderSlice(initialState, action);
        expect(state.orderRequest).toBe(true);
      });

      it('should handle fulfilled', () => {
        const action = {
          type: createOrder.fulfilled.type,
          payload: { order: mockOrder, name: 'Order 1' }
        };
        const state = orderSlice(initialState, action);
        expect(state.orderRequest).toBe(false);
        expect(state.orderModalData).toEqual(mockOrder);
      });

      it('should handle rejected', () => {
        const action = { type: createOrder.rejected.type };
        const state = orderSlice(initialState, action);
        expect(state.orderRequest).toBe(false);
      });

      it('should create order successfully', async () => {
        mockedOrderBurgerApi.mockResolvedValue({
          success: true,
          name: 'Order 1',
          order: mockOrder
        });

        const store = configureStore({
          reducer: {
            order: orderSlice
          }
        });

        await store.dispatch(createOrder(['ing1', 'ing2']));

        const state = store.getState().order;
        expect(state.orderRequest).toBe(false);
        expect(state.orderModalData).toEqual(mockOrder);
      });
    });

    describe('fetchOrderNumber', () => {
      it('should handle pending', () => {
        const action = { type: fetchOrderNumber.pending.type };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingNumber).toBe(true);
      });

      it('should handle fulfilled', () => {
        const action = {
          type: fetchOrderNumber.fulfilled.type,
          payload: mockOrder
        };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingNumber).toBe(false);
        expect(state.orderModalData).toEqual(mockOrder);
      });

      it('should handle rejected', () => {
        const action = { type: fetchOrderNumber.rejected.type };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingNumber).toBe(false);
      });

      it('should fetch order by number successfully', async () => {
        mockedGetOrderByNumberApi.mockResolvedValue({
          success: true,
          orders: [mockOrder]
        });

        const store = configureStore({
          reducer: {
            order: orderSlice
          }
        });

        await store.dispatch(fetchOrderNumber(1));

        const state = store.getState().order;
        expect(state.isLoadingNumber).toBe(false);
        expect(state.orderModalData).toEqual(mockOrder);
      });
    });

    describe('fetchOrder', () => {
      it('should handle pending', () => {
        const action = { type: fetchOrder.pending.type };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingOrder).toBe(true);
        expect(state.orderError).toBeNull();
      });

      it('should handle fulfilled', () => {
        const action = {
          type: fetchOrder.fulfilled.type,
          payload: mockOrders
        };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingOrder).toBe(false);
        expect(state.orderError).toBeNull();
        expect(state.order).toEqual(mockOrders);
      });

      it('should handle rejected', () => {
        const error = { message: 'Request failed' };
        const action = {
          type: fetchOrder.rejected.type,
          error
        };
        const state = orderSlice(initialState, action);
        expect(state.isLoadingOrder).toBe(false);
        expect(state.orderError).toEqual(error);
      });

      it('should fetch orders successfully', async () => {
        mockedGetOrdersApi.mockResolvedValue(mockOrders);

        const store = configureStore({
          reducer: {
            order: orderSlice
          }
        });

        await store.dispatch(fetchOrder());

        const state = store.getState().order;
        expect(state.isLoadingOrder).toBe(false);
        expect(state.order).toEqual(mockOrders);
      });
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      order: {
        order: mockOrders,
        orderRequest: false,
        orderError: null,
        orderModalData: mockOrder,
        isLoadingNumber: false,
        isLoadingOrder: false
      },
      feed: {
        items: {
          orders: mockOrders,
          total: 2,
          totalToday: 1,
          success: true
        },
        loading: false,
        error: null
      },
      // Другие слайсы, если они нужны для RootState
      builder: {} as any,
      ingredients: {} as any,
      user: {} as any
    };

    it('should select all orders', () => {
      expect(selectOrders(mockRootState)).toEqual(mockOrders);
    });

    it('should select order request status', () => {
      expect(selectOrderRequest(mockRootState)).toBe(false);
    });

    it('should select order modal data', () => {
      expect(selectOrderModalData(mockRootState)).toEqual(mockOrder);
    });

    describe('orderDataSelector', () => {
      it('should find order in order slice', () => {
        const selector = orderDataSelector('1');
        expect(selector(mockRootState)).toEqual(mockOrder);
      });

      it('should find order in feed slice', () => {
        const selector = orderDataSelector('2');
        expect(selector(mockRootState)).toEqual(mockOrders[1]);
      });

      it('should return modal data if no order found', () => {
        const selector = orderDataSelector('3');
        const state = {
          ...mockRootState,
          order: { ...mockRootState.order, order: [] },
          feed: { ...mockRootState.feed, items: { ...mockRootState.feed.items, orders: [] } }
        };
        expect(selector(state)).toEqual(mockOrder);
      });

      it('should return null if no data found', () => {
        const selector = orderDataSelector('999');
        const state = {
          ...mockRootState,
          order: { ...mockRootState.order, order: [], orderModalData: null },
          feed: { ...mockRootState.feed, items: { ...mockRootState.feed.items, orders: [] } }
        };
        expect(selector(state)).toBeNull();
      });
    });
  });
});
