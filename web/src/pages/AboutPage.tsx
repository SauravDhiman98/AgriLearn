import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function AboutPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const accent = '#194552'

  const features = [
    { icon: '📚', title: 'Study Notes', desc: 'Comprehensive chapter-wise notes for all major agriculture competitive exams, uploaded by experts.' },
    { icon: '🎬', title: 'Video Lectures', desc: 'Curated YouTube video lectures organised by subject and chapter for easy learning.' },
    { icon: '🤖', title: 'AI-Powered MCQs', desc: 'AI generates practice MCQ questions from your study notes — test yourself anytime.' },
    { icon: '📋', title: 'Exam Information', desc: 'Complete details on eligibility, exam pattern, syllabus, dates, and salary for every exam.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Track your MCQ scores, attempt history, and preparation progress over time.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Study comfortably day or night with full dark mode support across the entire platform.' },
  ]

  const exams = [
    { icon: '🌾', name: 'UPCATET', full: 'UP Combined Agriculture & Technology Entrance Test' },
    { icon: '🏦', name: 'IBPS AFO', full: 'Agriculture Field Officer' },
    { icon: '🏭', name: 'FCI', full: 'Food Corporation of India' },
    { icon: '📝', name: 'UPSSSC', full: 'UP Subordinate Service Selection Commission' },
    { icon: '🔬', name: 'IARI', full: 'Indian Agricultural Research Institute' },
    { icon: '🌱', name: 'NABARD', full: 'National Bank for Agriculture' },
  ]

  const stats = [
    { value: '6+', label: 'Exams Covered' },
    { value: '100%', label: 'Free Forever' },
    { value: '∞', label: 'Practice Tests' },
    { value: '24/7', label: 'Available' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #0d6e84 100%)`, padding: '64px 16px', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <img src="/logo.png" alt="Tassy Point" style={{ height: '70px', objectFit: 'contain', marginBottom: '16px', filter: 'brightness(0) invert(1)' }}
            onError={(e: any) => { e.target.style.display = 'none' }} />
          <h1 style={{ fontSize: '38px', fontWeight: '900', marginBottom: '12px', lineHeight: '1.2' }}>
            🌱 Tassy Point
          </h1>
          <p style={{ fontSize: '18px', color: '#9ecfda', marginBottom: '8px', fontWeight: '600' }}>
            India's Free AgriLearn Platform
          </p>
          <p style={{ fontSize: '15px', color: '#b0d9e4', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto' }}>
            Empowering agriculture students and professionals to crack India's most competitive agricultural examinations — completely free, forever.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: isDark ? '#1f2937' : '#194552', padding: '28px 16px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#9ecfda', fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px' }}>

        {/* Our Mission */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: text, marginBottom: '14px' }}>
            🎯 Our Mission
          </h2>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: text, marginBottom: '12px' }}>
            Agriculture is the backbone of India — yet students preparing for agricultural competitive exams have far fewer
            free resources compared to engineering or medical aspirants. <strong>Tassy Point was built to change that.</strong>
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: text, marginBottom: '12px' }}>
            We believe every agriculture student — whether in a tier-1 city or a remote village — deserves access to
            high-quality, structured study material without paying a rupee.
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: text }}>
            Our platform combines <strong>expert-curated notes</strong>, <strong>AI-powered practice tests</strong>, and
            <strong> detailed exam guidance</strong> all in one place — accessible on web and mobile.
          </p>
        </div>

        {/* What We Offer */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: text, marginBottom: '20px' }}>⚡ What We Offer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                padding: '18px', borderRadius: '12px',
                background: isDark ? '#111827' : '#f8fafc',
                border: `1px solid ${border}`,
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{f.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: text, marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: muted, lineHeight: '1.6' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Exams we cover */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: text, marginBottom: '18px' }}>📋 Exams We Cover</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {exams.map((e, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '10px',
                background: isDark ? '#111827' : '#f0f9ff',
                border: `1px solid ${isDark ? '#374151' : '#bae6fd'}`,
              }}>
                <span style={{ fontSize: '24px' }}>{e.icon}</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: text }}>{e.name}</div>
                  <div style={{ fontSize: '12px', color: muted }}>{e.full}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Free */}
        <div style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0d6e84 100%)`,
          borderRadius: '14px', padding: '28px', marginBottom: '28px', color: '#fff'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>💚 Why Is It Free?</h2>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: '#c7e9f1', marginBottom: '12px' }}>
            We believe quality education should never be locked behind a paywall. Tassy Point is built and maintained
            by a passionate team that wants to give back to the agriculture community.
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.85', color: '#c7e9f1' }}>
            Every feature — notes, videos, MCQ tests, exam information — is <strong style={{ color: '#4ade80' }}>100% free</strong> and
            will remain so. No hidden charges, no premium tiers, no paywalls.
          </p>
        </div>

        {/* Tech Stack */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: text, marginBottom: '14px' }}>🛠️ Built With</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['Spring Boot 3', 'React 18', 'React Native', 'PostgreSQL', 'Tailwind CSS', 'OpenAI / GitHub Models', 'Backblaze B2', 'Railway', 'Render'].map((tech, i) => (
              <span key={i} style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                backgroundColor: isDark ? '#374151' : '#e0f2fe',
                color: isDark ? '#93c5fd' : '#0369a1',
                border: `1px solid ${isDark ? '#4b5563' : '#bae6fd'}`,
              }}>{tech}</span>
            ))}
          </div>
        </div>

        {/* Contact / CTA */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: text, marginBottom: '10px' }}>📬 Get In Touch</h2>
          <p style={{ color: muted, fontSize: '14px', marginBottom: '20px' }}>
            Have suggestions, feedback, or want to contribute content? We'd love to hear from you.
          </p>
          <a href="mailto:support@tassypoint.in" style={{
            display: 'inline-block', padding: '12px 32px', borderRadius: '10px',
            background: `linear-gradient(90deg, ${accent}, #0d6e84)`,
            color: '#fff', fontWeight: '700', fontSize: '15px', textDecoration: 'none', marginBottom: '20px'
          }}>✉️ support@tassypoint.in</a>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Link to="/privacy-policy" style={{ fontSize: '13px', color: '#0369a1', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: muted }}>|</span>
            <Link to="/terms" style={{ fontSize: '13px', color: '#0369a1', textDecoration: 'none' }}>Terms & Conditions</Link>
            <span style={{ color: muted }}>|</span>
            <Link to="/exams" style={{ fontSize: '13px', color: '#0369a1', textDecoration: 'none' }}>Start Learning</Link>
          </div>

          <div style={{ marginTop: '20px', borderTop: `1px solid ${border}`, paddingTop: '16px', color: muted, fontSize: '13px' }}>
            © 2025 Tassy Point. Made with ❤️ for India's agriculture students.
          </div>
        </div>

        <button onClick={() => navigate(-1)} style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, cursor: 'pointer', fontSize: '14px', color: text }}>
          ← Go Back
        </button>
      </div>
    </div>
  )
}
