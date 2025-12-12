import { Route, Routes, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSTerminalPage from "./pages/POSTerminalPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import AdminSystemMonitoring from "./pages/AdminSystemMonitoring";
import ManagerAnalyticsDashboard from "./pages/ManagerAnalyticsDashboard";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access denied</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Your role does not have permission for this area.</p>
      <div className="flex gap-3 justify-center">
        <a
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to dashboard
        </a>
        <a
          href="/pos"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          POS
        </a>
      </div>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user
            ? (
                <Navigate
                  to={
                    {
                      admin: '/system-monitoring',
                      manager: '/dashboard',
                      inventory_manager: '/products',
                      cashier: '/pos',
                    }[user.role] || '/dashboard'
                  }
                  replace
                />
              )
            : <LoginPage />
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute allowedRoles={["admin", "cashier"]}>
            <POSTerminalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "inventory_manager"]}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-monitoring"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminSystemMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <ManagerAnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
