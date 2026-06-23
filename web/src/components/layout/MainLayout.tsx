import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useTheme } from '../../context/ThemeContext'

export default function MainLayout() {
  const { isDark } = useTheme()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? '#111827' : '#f9fafb',
      color: isDark ? '#f9fafb' : '#111827',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
