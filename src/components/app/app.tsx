import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { AppHeader, OrderInfo, IngredientDetails, Modal } from '@components';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = location.state?.background;

  const handleModalClose = () => {
    // Возвращаемся на предыдущий маршрут
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        {/* Основные маршруты */}
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />

        {/* Маршруты с модальными окнами */}
        <Route path='/feed/:number' element={<OrderInfo />} />
        <Route path='/ingredients/:id' element={<IngredientDetails />} />

        {/* Защищённые маршруты */}
        <Route
          path='/login'
          element={
            <ProtectedRoute anonymous>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute anonymous>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute anonymous>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute anonymous>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <OrderInfo />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path='*' element={<NotFound404 />} />
      </Routes>

      {/* Модальные окна */}
      {/*{background && (*/}
      {/*  <Routes>*/}
      {/*    <Route*/}
      {/*      path='/feed/:number'*/}
      {/*      element={*/}
      {/*        <Modal title='Детали заказа' onClose={handleModalClose}>*/}
      {/*          <OrderInfo />*/}
      {/*        </Modal>*/}
      {/*      }*/}
      {/*    />*/}
      {/*    <Route*/}
      {/*      path='/ingredients/:id'*/}
      {/*      element={*/}
      {/*        <Modal title='Детали ингредиента' onClose={handleModalClose}>*/}
      {/*          <IngredientDetails />*/}
      {/*        </Modal>*/}
      {/*      }*/}
      {/*    />*/}
      {/*    <Route*/}
      {/*      path='/profile/orders/:number'*/}
      {/*      element={*/}
      {/*        <Modal title='Детали заказа' onClose={handleModalClose}>*/}
      {/*          <OrderInfo />*/}
      {/*        </Modal>*/}
      {/*      }*/}
      {/*    />*/}
      {/*  </Routes>*/}
      {/*)}*/}
    </div>
  );
};

// Компонент для защищённых маршрутов
const ProtectedRoute = ({
  children,
  anonymous = false
}: {
  children: JSX.Element;
  anonymous?: boolean;
}) => {
  const isAuthenticated = /* ваша логика проверки аутентификации */ false;

  if (anonymous && isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  if (!anonymous && !isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default App;
