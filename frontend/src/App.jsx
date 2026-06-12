import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Components
import StudentLayout from './components/student/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import AvailableAssessments from './pages/student/AvailableAssessments';
import Instructions from './pages/student/Instructions';
import TakeAssessment from './pages/student/TakeAssessment';
import AssessmentResult from './pages/student/AssessmentResult';
import ReviewAnswers from './pages/student/ReviewAnswers';
import MyResults from './pages/student/MyResults';
import StudentProfile from './pages/student/Profile';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Assessments from './pages/admin/Assessments';
import Questions from './pages/admin/Questions';
import Students from './pages/admin/Students';
import Results from './pages/admin/Results';
import Analytics from './pages/admin/Analytics';
import Reports from './pages/admin/Reports';
import AdminProfile from './pages/admin/Profile';

// Common Components
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedStudentRoute = ({ children }) => {
  const { isStudentAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isStudentAuthenticated ? children : <Navigate to="/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAdminAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedStudentRoute>
              <StudentLayout />
            </ProtectedStudentRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assessments" element={<AvailableAssessments />} />
          <Route path="assessments/:id/instructions" element={<Instructions />} />
          <Route path="assessments/:id/take" element={<TakeAssessment />} />
          <Route path="results/:submissionId" element={<AssessmentResult />} />
          <Route path="results/:submissionId/review" element={<ReviewAnswers />} />
          <Route path="my-results" element={<MyResults />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="assessments/:id/questions" element={<Questions />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<Results />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;