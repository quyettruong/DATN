import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// Core Layouts (eagerly loaded for instant shell paint)
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PatientPortalLayout from '../layouts/PatientPortalLayout';

// Lazy-loaded Public & Patient Pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const QueueDisplayBoard = lazy(() => import('../pages/queue/QueueDisplayBoard'));
const AppointmentPage = lazy(() => import('../pages/patient/AppointmentPage'));
const QueueStatusPage = lazy(() => import('../pages/patient/QueueStatusPage'));
const PatientPrescriptionsPage = lazy(() => import('../pages/patient/PrescriptionsPage'));
const PatientHistoryPage = lazy(() => import('../pages/patient/HistoryPage'));
const InvoiceHistoryPage = lazy(() => import('../pages/patient/InvoiceHistoryPage'));
const FollowUpPage = lazy(() => import('../pages/patient/FollowUpPage'));
const SpecialtiesPage = lazy(() => import('../pages/patient/SpecialtiesPage'));
const DoctorDirectoryPage = lazy(() => import('../pages/patient/DoctorDirectoryPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Lazy-loaded Staff Pages
const StaffDashboard = lazy(() => import('../pages/staff/StaffDashboard'));
const CheckInPage = lazy(() => import('../pages/staff/CheckInPage'));
const QueueBoardPage = lazy(() => import('../pages/staff/QueueBoardPage'));
const BillingPage = lazy(() => import('../pages/staff/BillingPage'));
const PharmacyDispensePage = lazy(() => import('../pages/staff/PharmacyDispensePage'));
const TriagePage = lazy(() => import('../pages/staff/TriagePage'));
const StaffAppointmentsPage = lazy(() => import('../pages/staff/StaffAppointmentsPage'));

// Lazy-loaded Doctor Pages
const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const DoctorQueuePage = lazy(() => import('../pages/doctor/DoctorQueuePage'));
const ExaminationPage = lazy(() => import('../pages/doctor/ExaminationPage'));
const PrescriptionPage = lazy(() => import('../pages/doctor/PrescriptionPage'));
const DoctorSchedulePage = lazy(() => import('../pages/doctor/DoctorSchedulePage'));

// Lazy-loaded Shared Profile Page
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage'));
const InventoryPage = lazy(() => import('../pages/admin/InventoryPage'));
const DepartmentManagementPage = lazy(() => import('../pages/admin/DepartmentManagementPage'));
const MedicationCatalogPage = lazy(() => import('../pages/admin/MedicationCatalogPage'));
const LabTestCatalogPage = lazy(() => import('../pages/admin/LabTestCatalogPage'));
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettingsPage'));

// Lazy-loaded Lab Pages
const LabDashboard = lazy(() => import('../pages/lab/LabDashboard'));
const LabOrdersPage = lazy(() => import('../pages/lab/LabOrdersPage'));

export const getRoleHomePath = (role) => {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'DOCTOR': return '/doctor';
    case 'STAFF': return '/staff';
    case 'LAB_TECHNICIAN': return '/lab';
    case 'PATIENT':
    default: return '/';
  }
};

const PageLoader = () => (
  <div className="flex flex-col min-h-[60vh] items-center justify-center gap-3">
    <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    <p className="text-xs font-bold text-slate-500 tracking-wide">Đang tải không gian làm việc MediCare...</p>
  </div>
);

// Adaptive layout so Clinical/Admin roles stay in DashboardLayout when opening /profile
const AdaptiveProfileLayout = () => {
  const { user } = useAuthStore();
  if (user?.role && user.role !== 'PATIENT') {
    return <DashboardLayout />;
  }
  return <PatientPortalLayout />;
};

// Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Route for Login page to redirect if already authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }
  
  return children;
};

const FallbackStatusPage = ({ code, title, subtitle }) => {
  const { isAuthenticated, user } = useAuthStore();
  const backPath = isAuthenticated ? getRoleHomePath(user?.role) : '/';
  const backLabel = isAuthenticated && user?.role && user.role !== 'PATIENT'
    ? 'Quay lại Bảng điều khiển'
    : 'Về Trang chủ MediCare';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full">
        <span className="inline-block px-3.5 py-1 rounded-full bg-rose-50 text-rose-600 font-mono text-xs font-black border border-rose-200 mb-3">
          MÃ TRẠNG THÁI {code}
        </span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
        <Link
          to={backPath}
          className="inline-flex items-center justify-center w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 transition-all"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public & Patient Portal (MediCare Full Website Style) ── */}
        <Route element={<PatientPortalLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/patient" element={<HomePage />} />
          <Route path="/specialties" element={<SpecialtiesPage />} />
          <Route path="/departments" element={<SpecialtiesPage />} />
          <Route path="/doctors" element={<DoctorDirectoryPage />} />
          <Route path="/patient/appointments" element={<AppointmentPage />} />
          <Route path="/patient/appointments/new" element={<AppointmentPage />} />
          <Route path="/patient/queue" element={<QueueStatusPage />} />
          <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientHistoryPage /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientPrescriptionsPage /></ProtectedRoute>} />
          <Route path="/patient/invoices" element={<ProtectedRoute allowedRoles={['PATIENT']}><InvoiceHistoryPage /></ProtectedRoute>} />
          <Route path="/patient/follow-ups" element={<ProtectedRoute allowedRoles={['PATIENT']}><FollowUpPage /></ProtectedRoute>} />
        </Route>

        {/* Adaptive Profile Route: DashboardLayout for Staff/Doctor/Admin/Lab, PatientPortalLayout for Patient */}
        <Route element={<AdaptiveProfileLayout />}>
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        {/* Public TV Queue Board */}
        <Route path="/queue-display" element={<QueueDisplayBoard />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        </Route>

        {/* ── Clinical & Administrative Workspace (Staff, Doctor, Admin, Lab) ── */}
        <Route element={<DashboardLayout />}>
          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/check-in" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><CheckInPage /></ProtectedRoute>} />
          <Route path="/staff/queue-board" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><QueueBoardPage /></ProtectedRoute>} />
          <Route path="/staff/billing" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><BillingPage /></ProtectedRoute>} />
          <Route path="/staff/pharmacy" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><PharmacyDispensePage /></ProtectedRoute>} />
          <Route path="/staff/triage" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><TriagePage /></ProtectedRoute>} />
          <Route path="/staff/appointments" element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}><StaffAppointmentsPage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/queue" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorQueuePage /></ProtectedRoute>} />
          <Route path="/doctor/examination" element={<ProtectedRoute allowedRoles={['DOCTOR']}><ExaminationPage /></ProtectedRoute>} />
          <Route path="/doctor/examination/:ticketId" element={<ProtectedRoute allowedRoles={['DOCTOR']}><ExaminationPage /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['DOCTOR']}><PrescriptionPage /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorSchedulePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['ADMIN']}><InventoryPage /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><DepartmentManagementPage /></ProtectedRoute>} />
          <Route path="/admin/medications" element={<ProtectedRoute allowedRoles={['ADMIN']}><MedicationCatalogPage /></ProtectedRoute>} />
          <Route path="/admin/lab-tests" element={<ProtectedRoute allowedRoles={['ADMIN']}><LabTestCatalogPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SystemSettingsPage /></ProtectedRoute>} />

          {/* Lab Routes */}
          <Route path="/lab" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}><LabDashboard /></ProtectedRoute>} />
          <Route path="/lab/orders" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}><LabOrdersPage /></ProtectedRoute>} />
          <Route path="/lab/processing" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}><LabOrdersPage /></ProtectedRoute>} />
          <Route path="/lab/results" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}><LabOrdersPage /></ProtectedRoute>} />
          <Route path="/lab/history" element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN', 'ADMIN']}><LabOrdersPage /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route
          path="/unauthorized"
          element={
            <FallbackStatusPage
              code="403"
              title="Không đủ quyền truy cập"
              subtitle="Tài khoản hiện tại của bạn không được phân quyền vào phân hệ nghiệp vụ này."
            />
          }
        />
        <Route
          path="*"
          element={
            <FallbackStatusPage
              code="404"
              title="Không tìm thấy trang yêu cầu"
              subtitle="Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển trong hệ thống."
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
