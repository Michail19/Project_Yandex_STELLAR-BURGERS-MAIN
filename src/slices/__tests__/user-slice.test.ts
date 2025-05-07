import { configureStore } from '@reduxjs/toolkit';
import userSlice, {
  registerUser,
  loginUser,
  logoutUser,
  fetchUser,
  updateUser,
  selectIsAuthenticated,
  selectUserData,
  selectLoginError,
  selectRegisterError,
  TUserState
} from '../user-slice';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  getUserApi,
  updateUserApi
} from '@api';
import { TUser } from '@utils-types';

jest.mock('@api', () => ({
  registerUserApi: jest.fn(),
  loginUserApi: jest.fn(),
  logoutApi: jest.fn(),
  getUserApi: jest.fn(),
  updateUserApi: jest.fn()
}));

jest.mock('../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn()
}));

const mockedRegisterUserApi = registerUserApi as jest.MockedFunction<
  typeof registerUserApi
>;
const mockedLoginUserApi = loginUserApi as jest.MockedFunction<
  typeof loginUserApi
>;
const mockedLogoutApi = logoutApi as jest.MockedFunction<typeof logoutApi>;
const mockedGetUserApi = getUserApi as jest.MockedFunction<typeof getUserApi>;
const mockedUpdateUserApi = updateUserApi as jest.MockedFunction<
  typeof updateUserApi
>;
const mockedSetCookie = jest.requireMock('../../utils/cookie').setCookie;
const mockedDeleteCookie = jest.requireMock('../../utils/cookie').deleteCookie;

describe('user slice', () => {
  const mockUser: TUser = {
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockApiResponse = {
    success: true,
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token'
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(userSlice(undefined, { type: 'unknown' })).toEqual({
      data: null,
      isAuthenticated: false
    });
  });

  describe('async thunks', () => {
    describe('registerUser', () => {
      it('should handle pending', () => {
        const action = { type: registerUser.pending.type };
        const state = userSlice(undefined, action);
        expect(state.registerError).toBeUndefined();
      });

      it('should handle fulfilled', () => {
        const action = {
          type: registerUser.fulfilled.type,
          payload: mockUser
        };
        const state = userSlice(undefined, action);
        expect(state.registerError).toBeUndefined();
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });

      it('should handle rejected', () => {
        const error = { message: 'Registration failed' };
        const action = {
          type: registerUser.rejected.type,
          error,
          payload: error,
          meta: {
            rejectedWithValue: true
          }
        };
        const state = userSlice(undefined, action);
        expect(state.registerError).toEqual(error);
      });

      it('should register user successfully', async () => {
        mockedRegisterUserApi.mockResolvedValue(mockApiResponse);

        const store = configureStore({
          reducer: {
            user: userSlice
          }
        });

        await store.dispatch(
          registerUser({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password'
          })
        );

        const state = store.getState().user;
        expect(mockedSetCookie).toHaveBeenCalledTimes(2);
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });
    });

    describe('loginUser', () => {
      it('should handle pending', () => {
        const action = { type: loginUser.pending.type };
        const state = userSlice(undefined, action);
        expect(state.loginError).toBeUndefined();
      });

      it('should handle fulfilled', () => {
        const action = {
          type: loginUser.fulfilled.type,
          payload: mockUser
        };
        const state = userSlice(undefined, action);
        expect(state.loginError).toBeUndefined();
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });

      it('should handle rejected', () => {
        const error = { message: 'Login failed' };
        const action = {
          type: loginUser.rejected.type,
          error,
          payload: error,
          meta: {
            rejectedWithValue: true
          }
        };
        const state = userSlice(undefined, action);
        expect(state.loginError).toEqual(error);
      });

      it('should login user successfully', async () => {
        mockedLoginUserApi.mockResolvedValue(mockApiResponse);

        const store = configureStore({
          reducer: {
            user: userSlice
          }
        });

        await store.dispatch(
          loginUser({
            email: 'test@example.com',
            password: 'password'
          })
        );

        const state = store.getState().user;
        expect(mockedSetCookie).toHaveBeenCalledWith(
          'accessToken',
          'access-token'
        );
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });
    });

    describe('logoutUser', () => {
      it('should handle fulfilled', () => {
        const initialStateWithUser: TUserState = {
          data: mockUser,
          isAuthenticated: true
        };

        const action = { type: logoutUser.fulfilled.type };
        const state = userSlice(initialStateWithUser, action);
        expect(state.isAuthenticated).toBe(false);
        expect(state.data).toBeNull();
      });

      it('should logout user successfully', async () => {
        mockedLogoutApi.mockResolvedValue({ success: true });

        const store = configureStore({
          reducer: {
            user: userSlice
          },
          preloadedState: {
            user: {
              data: mockUser,
              isAuthenticated: true
            }
          }
        });

        await store.dispatch(logoutUser());

        const state = store.getState().user;
        expect(mockedDeleteCookie).toHaveBeenCalledWith('accessToken');
        expect(state.isAuthenticated).toBe(false);
        expect(state.data).toBeNull();
      });
    });

    describe('fetchUser', () => {
      it('should handle fulfilled', () => {
        const action = {
          type: fetchUser.fulfilled.type,
          payload: mockUser
        };
        const state = userSlice(undefined, action);
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });

      it('should fetch user data successfully', async () => {
        mockedGetUserApi.mockResolvedValue({
          success: true,
          user: mockUser
        });

        const store = configureStore({
          reducer: {
            user: userSlice
          }
        });

        await store.dispatch(fetchUser());

        const state = store.getState().user;
        expect(state.isAuthenticated).toBe(true);
        expect(state.data).toEqual(mockUser);
      });
    });

    describe('updateUser', () => {
      it('should handle fulfilled', () => {
        const updatedUser = {
          ...mockUser,
          name: 'Updated User'
        };

        const action = {
          type: updateUser.fulfilled.type,
          payload: updatedUser
        };
        const state = userSlice(undefined, action);
        expect(state.data).toEqual(updatedUser);
      });

      it('should update user data successfully', async () => {
        const updatedUser = {
          ...mockUser,
          name: 'Updated User'
        };

        mockedUpdateUserApi.mockResolvedValue({
          success: true,
          user: updatedUser
        });

        const store = configureStore({
          reducer: {
            user: userSlice
          },
          preloadedState: {
            user: {
              data: mockUser,
              isAuthenticated: true
            }
          }
        });

        await store.dispatch(
          updateUser({
            name: 'Updated User',
            email: 'test@example.com'
          })
        );

        const state = store.getState().user;
        expect(state.data).toEqual(updatedUser);
      });
    });
  });

  describe('selectors', () => {
    const mockState = {
      user: {
        data: mockUser,
        isAuthenticated: true,
        loginError: null,
        registerError: null
      },
      // Другие слайсы, если они нужны для RootState
      feed: {} as any,
      builder: {} as any,
      ingredients: {} as any,
      order: {} as any
    };

    it('should select isAuthenticated', () => {
      // @ts-ignore
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('should select user data', () => {
      // @ts-ignore
      expect(selectUserData(mockState)).toEqual(mockUser);
    });

    it('should select login error', () => {
      const errorState = {
        ...mockState,
        user: {
          ...mockState.user,
          loginError: { message: 'Login failed' }
        }
      };
      // @ts-ignore
      expect(selectLoginError(errorState)).toEqual({ message: 'Login failed' });
    });

    it('should select register error', () => {
      const errorState = {
        ...mockState,
        user: {
          ...mockState.user,
          registerError: { message: 'Register failed' }
        }
      };
      // @ts-ignore
      expect(selectRegisterError(errorState)).toEqual({
        message: 'Register failed'
      });
    });
  });
});
