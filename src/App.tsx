import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth.tsx';
import { SensitiveInfoProvider } from './hooks/useSensitiveInfo';
import { ThemeProvider } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Homepage from './pages/Homepage';
import Solutions from './pages/Solutions';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Transactions from './pages/Transactions';
import CreateTransaction from './pages/CreateTransaction';
import EditTransaction from './pages/EditTransaction';
import TransactionDetails from './pages/TransactionDetails';
import PaymentCode from './pages/PaymentCode';
import InitiatePayment from './pages/InitiatePayment';
import Accounts from './pages/Accounts';
import Profile from './pages/Profile';
import Users from './pages/Users';
import PaymentCallback from './pages/PaymentCallback';
import BuildSite from './pages/BuildSite';
import LinkSite from './pages/LinkSite';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <SensitiveInfoProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/"
                element={<Homepage />}
              />

              <Route
                path="/solutions"
                element={<Solutions />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Marketplace />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transactions/create"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateTransaction />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transactions/edit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditTransaction />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transactions/:transactionId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TransactionDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pay/:paymentCode"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PaymentCode />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment/initiate-payment/:transactionId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InitiatePayment />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Accounts />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment-callback"
                element={<PaymentCallback />}
              />

              <Route
                path="/build-site"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <BuildSite />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route path="/linksite/:uniqueName" element={<LinkSite />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SensitiveInfoProvider>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;