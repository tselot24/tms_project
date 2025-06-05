import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import Home from './components/Home';
import Services from './components/Services';
import WhyTMS from './components/WhyTMS';
import EmailForm from './components/EmailForm';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminPage from './components/AdminPage';
import AdminDepartmentPage from './components/AdminDepartmentPage';
import AccountPage from './components/AccountPage';
import HistoryPage from './components/HistoryPage';
import VehicleManagement from './components/VehicleManagement';
import EmployeePage from './components/EmployeePage';
import PleaseLoginPage from './PleaseLoginPage';
import MaintenanceRequest from './components/MaintenanceRequest';
import MaintenanceTable from './components/MaintenanceTable';
import VehicleRequest from './components/VehicleRequest';
import DriverSchedule from './components/DriverSchedule';
import RefuelingRequest from './components/RefuelingRequest';
import FMRefuelingTable from './components/FMRefuelingTable';
import RefuelingTable from './components/RefuelingTable';
import TransportManagerDashbord from './components/TransportManagerDashbord';
import ReportPage from './components/ReportPage';
import TransportRequest from './components/TransportRequest';
import TransportHistory from './components/TransportHistory';
import DepartmentHistory from './components/DepartmentHistory';
import { ENDPOINTS } from './utilities/endpoints';
import { NotificationProvider } from './context/NotificationContext';
import CEOMaintenanceTable from './components/CEOMaintenanceTable';
import FinanceMaintenanceTable from './components/FinanceMaintenanceTable';
import TMRefuelingTable from './components/TMRefuelingTable';
import HightCost from './components/HightCost';
import HighCostRequests from './components/HighCostDriverSchedule';
import BUHighCost from './components/BUHighCost';
import TMhighcostrequests from './components/TMhighcostrequests';
import FIHighCost from './components/FIHighCost';
import HighCostDriverSchedule from './components/HighCostDriverSchedule';
import VehicleServices from './components/VehicleServices';
import GSmaintenance from './components/GSmaintenance';
import BUmaintenance from './components/BUmaintenance';
import CEOhighcost from './components/CEOhighcost';

const ProtectedRoute = ({ children, isAuthenticated, redirectTo }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }
  return children;
};

const App = () => {
  const [modalType, setModalType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken')
  );
  
  const [authToken, setAuthToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const homeRef = useRef(null);
  const servicesRef = useRef(null);
  const whyTMSRef = useRef(null);
  const emailFormRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      setAuthToken(token);
      checkUserRole(token);
    }
  }, []);

  const checkUserRole = async (token) => {
    try {
      const response = await fetch(ENDPOINTS.CURRENT_USER, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const closeModal = () => setModalType(null);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access);
        setIsAuthenticated(true);
        setAuthToken(data.access);
        setModalType(null);

        const userResponse = await fetch(ENDPOINTS.CURRENT_USER, {
          method: 'GET',
          headers: { Authorization: `Bearer ${data.access}` },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserRole(userData.role);

          // Redirect based on role
          switch (userData.role) {
            case 'admin':
              navigate('/admin/admin');
              break;
            case 'employee':
              navigate('/employee');
              break;
            case 'department_manager':
              navigate('/department-manager/vehicle-request');
              break;
            case 'finance_manager':
              navigate('/finance-manager');
              break;
            case 'transport_manager':
              navigate('/transport-manager/transport-dashbord');
              break;
            case 'ceo':
              navigate('/ceo/vehicle-request');
              break;
            case 'driver':
              navigate('/driver/driver-schedule');
              break;
            default:
              navigate('/'); // Fallback
              break;
          }
        }
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <NotificationProvider>
      <ThemeProvider>
        <LanguageProvider>
          <div className={`app ${modalType ? 'blurred' : ''}`}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <NavBar
                      homeRef={homeRef}
                      servicesRef={servicesRef}
                      whyTMSRef={whyTMSRef}
                      emailFormRef={emailFormRef}
                      footerRef={footerRef}
                      onOpenModal={setModalType}
                    />
                    <div ref={homeRef}><Home /></div>
                    <div ref={servicesRef}><Services /></div>
                    <div ref={whyTMSRef}><WhyTMS /></div>
                    <div ref={emailFormRef}><EmailForm /></div>
                    <Footer homeRef={homeRef} servicesRef={servicesRef} aboutRef={whyTMSRef} contactRef={emailFormRef} />
                  </>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/employee/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="employee" />
                      <div className="container">
                        <EmployeePage />
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/department-manager/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="department_manager" />
                      <Sidebar role="department_manager" />
                      <div className="container">
                        <Routes>
                          <Route path="vehicle-request" element={<VehicleRequest />} />
                          <Route path="refueling-request" element={<RefuelingRequest />} />
                          <Route path="history" element={<DepartmentHistory />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                          <Route path="hight-cost" element={<HightCost />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/finance-manager/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="finance_manager" />
                      <Sidebar role="finance_manager" />
                      <div className="container">
                        <Routes>
                          <Route path="vehicle-request" element={<VehicleRequest />} />
                          <Route path="financemaintenance-table" element={<FinanceMaintenanceTable />} />
                          <Route path="refueling" element={<FMRefuelingTable />} />
                          <Route path="hight-cost" element={<FIHighCost />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ceo/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="ceo" />
                      <Sidebar role="ceo" />
                      <div className="container">
                        <Routes>
                          <Route path="high_cost" element={<CEOhighcost />} />
                          <Route path="ceomaintenance-table" element={<CEOMaintenanceTable />} />
                          <Route path="refueling" element={<RefuelingTable />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="driver" />
                      <Sidebar role="driver" />
                      <div className="container">
                        <Routes>
                          <Route path="vehicle-services" element={<VehicleServices />} />
                          <Route path="driver-schedule" element={<DriverSchedule />} />
                          <Route path="refueling-request" element={<RefuelingRequest />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                          <Route path="high-cost-schedule" element={<HighCostDriverSchedule />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Admin Pages */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="admin" />
                      <Sidebar role="admin" />
                      <div className="container">
                        <Routes>
                          <Route path="admin" element={<AdminPage />} />
                          <Route path="admin-department" element={<AdminDepartmentPage />} />
                          <Route path="account-page" element={<AccountPage />} />
                          <Route path="history" element={<HistoryPage />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/transport-manager/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="transport_manager" />
                      <Sidebar role="transport_manager" />
                      <div className="container">
                        <Routes>
                          <Route path="vehicle-management" element={<VehicleManagement />} />
                          <Route path="maintenance-table" element={<MaintenanceTable />} />
                          <Route path="vehicle-request" element={<TransportRequest />} />
                          <Route path="transport-dashbord" element={<TransportManagerDashbord />} />
                          <Route path="refueling" element={<TMRefuelingTable />} />
                          <Route path="report" element={<ReportPage />} />
                          <Route path="high_cost" element={<TMhighcostrequests />} />
                          <Route path="history" element={<TransportHistory />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/budget-manager/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="budget_manager" />
                      <Sidebar role="budget_manager" />
                      <div className="container">
                        <Routes>
                          <Route path="high_cost" element={<BUHighCost />} />
                          <Route path="refueling" element={<RefuelingTable />} />
                          <Route path="report" element={<ReportPage />} />
                          <Route path="maintenance" element={<BUmaintenance />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/general-service/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated} redirectTo="/-login">
                    <div className="d-flex">
                      <Header role="general-service" />
                      <Sidebar role="general-service" />
                      <div className="container">
                        <Routes>
                          <Route path="high_cost" element={<CEOhighcost/>} />
                          <Route path="refueling" element={<RefuelingTable />} />
                          <Route path="report" element={<ReportPage />} />
                          <Route path="maintenance" element={<GSmaintenance />} />
                          <Route path="maintenance-request" element={<MaintenanceRequest />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route path="/-login" element={<PleaseLoginPage />} />
            </Routes>

            {/* Modals */}
            {modalType === 'login' && (
              <div className="modal-overlay">
                <div className="modal">
                  <button className="close-button" onClick={closeModal}>X</button>
                  <LoginModal onLogin={handleLogin} />
                </div>
              </div>
            )}
            {modalType === 'signup' && (
              <div className="modal-overlay">
                <div className="modal">
                  <button className="close-button" onClick={closeModal}>X</button>
                  <SignupModal />
                </div>
              </div>
            )}
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
};

export default App;