import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import CoursesPage from './pages/Courses/CoursesPage'
import CourseDetailPage from './pages/Courses/CourseDetailPage'
import LessonPage from './pages/Courses/LessonPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ForumPage from './pages/Forum/ForumPage'
import ForumPostPage from './pages/Forum/ForumPostPage'
import MarketplacePage from './pages/Marketplace/MarketplacePage'
import ProductDetailPage from './pages/Marketplace/ProductDetailPage'
import LiveClassesPage from './pages/LiveClasses/LiveClassesPage'
import ProfilePage from './pages/Profile/ProfilePage'
import AdminPage from './pages/Admin/AdminPage'
import LogViewerPage from './pages/Admin/LogViewerPage'
import LessonVideoUploadPage from './pages/Instructor/LessonVideoUploadPage'
import ExamsPage from './pages/Exams/ExamsPage'
import ExamDetailPage from './pages/Exams/ExamDetailPage'
import ExamInfoPage from './pages/Exams/ExamInfoPage'
import SubjectDetailPage from './pages/Exams/SubjectDetailPage'
import ChapterDetailPage from './pages/Exams/ChapterDetailPage'
import McqTestPage from './pages/Exams/McqTestPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth)
  return user?.role === 'ADMIN' ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/exam-info" element={<ExamInfoPage />} />
        <Route path="/exams/:id" element={<ExamDetailPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/exam-chapters/:id" element={<ChapterDetailPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/:id" element={<ForumPostPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<ProductDetailPage />} />
        <Route path="/live-classes" element={<LiveClassesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/mcq-tests/:id" element={<PrivateRoute><McqTestPage /></PrivateRoute>} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
        <Route path="/courses/:id/learn" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Instructor routes */}
        <Route path="/instructor/courses/:courseId/lessons/:lessonId/upload-video" element={<PrivateRoute><LessonVideoUploadPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/logs" element={<AdminRoute><LogViewerPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
