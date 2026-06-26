import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function PrivacyPolicyPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const accent = '#194552'

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '16px', fontWeight: '700', color: '#fff',
        background: `linear-gradient(90deg, ${accent}, #0d6e84)`,
        padding: '10px 16px', borderRadius: '8px', marginBottom: '14px'
      }}>{title}</h2>
      <div style={{ fontSize: '14.5px', lineHeight: '1.85', color: text }}>
        {children}
      </div>
    </div>
  )

  const Li = ({ children }: { children: React.ReactNode }) => (
    <li style={{ marginBottom: '6px', paddingLeft: '8px' }}>{children}</li>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #0d6e84 100%)`, padding: '48px 16px', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Privacy Policy</h1>
          <p style={{ color: '#9ecfda', fontSize: '15px' }}>Tassy Point — AgriLearn Platform</p>
          <p style={{ color: '#9ecfda', fontSize: '13px', marginTop: '6px' }}>Effective Date: June 27, 2025 &nbsp;|&nbsp; Last Updated: June 27, 2025</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Intro card */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '14.5px', lineHeight: '1.85', color: text }}>
            Welcome to <strong>Tassy Point</strong> ("we", "us", or "our"). We operate the website and mobile application
            known as <strong>Tassy Point</strong> — a free educational platform for competitive agricultural exam preparation
            in India (including UPCATET, IBPS AFO, FCI, UPSSSC, and other agriculture-related exams).
          </p>
          <p style={{ fontSize: '14.5px', lineHeight: '1.85', color: text, marginTop: '10px' }}>
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you
            use our platform. By using Tassy Point, you agree to the terms described in this policy.
          </p>
        </div>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px' }}>

          <Section title="1. Information We Collect">
            <p style={{ marginBottom: '10px' }}>We collect the following types of information:</p>
            <p style={{ fontWeight: '600', marginBottom: '6px' }}>a) Information You Provide</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
              <Li><strong>Account details:</strong> Name, email address, and password when you register</Li>
              <Li><strong>Profile information:</strong> Profile photo (optional)</Li>
              <Li><strong>Usage data:</strong> Exam attempts, MCQ scores, notes viewed, progress records</Li>
            </ul>
            <p style={{ fontWeight: '600', marginBottom: '6px' }}>b) Information Collected Automatically</p>
            <ul style={{ paddingLeft: '20px' }}>
              <Li><strong>Device information:</strong> Browser type, operating system, device type</Li>
              <Li><strong>Log data:</strong> IP address, pages visited, time and date of access</Li>
              <Li><strong>Cookies:</strong> Session tokens used for authentication (no advertising cookies)</Li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p style={{ marginBottom: '10px' }}>We use your information solely to provide and improve the Tassy Point platform:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <Li>Create and manage your account</Li>
              <Li>Deliver educational content — notes, videos, MCQ tests</Li>
              <Li>Track your exam preparation progress</Li>
              <Li>Generate AI-powered MCQ questions from study material</Li>
              <Li>Send important updates about the platform (no spam)</Li>
              <Li>Diagnose technical issues and improve platform performance</Li>
              <Li>Ensure platform security and prevent abuse</Li>
            </ul>
            <p style={{ marginTop: '12px', padding: '12px 16px', background: isDark ? '#1a2e1a' : '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
              ✅ <strong>We do not sell, rent, or share your personal data with any third-party advertisers or marketing companies.</strong>
            </p>
          </Section>

          <Section title="3. Data Storage & Security">
            <ul style={{ paddingLeft: '20px' }}>
              <Li>Your data is stored on secure cloud servers hosted on <strong>Railway</strong> (backend) and <strong>Render</strong> (frontend)</Li>
              <Li>Passwords are <strong>never stored in plain text</strong> — they are encrypted using BCrypt hashing</Li>
              <Li>All API communication is secured via <strong>HTTPS</strong></Li>
              <Li>Authentication uses <strong>JWT (JSON Web Tokens)</strong> with expiry and refresh mechanisms</Li>
              <Li>File storage (PDFs, notes) is handled securely via <strong>Backblaze B2</strong> object storage</Li>
            </ul>
            <p style={{ marginTop: '12px', color: muted, fontSize: '13.5px' }}>
              While we implement industry-standard security measures, no method of transmission over the internet is 100% secure.
              We encourage you to use a strong, unique password for your account.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p style={{ marginBottom: '10px' }}>We use the following third-party services to operate the platform:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${accent}, #0d6e84)` }}>
                  <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: '700' }}>Service</th>
                  <th style={{ padding: '10px 14px', color: '#fff', textAlign: 'left', fontWeight: '700' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Railway', 'Backend API hosting'],
                  ['Render', 'Frontend web hosting'],
                  ['Backblaze B2', 'File/PDF storage'],
                  ['GitHub Models (OpenAI)', 'AI-powered MCQ generation'],
                  ['Google Fonts', 'Typography'],
                ].map(([svc, purpose], i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : (isDark ? '#283747' : '#f8fafc') }}>
                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${border}`, fontWeight: '600' }}>{svc}</td>
                    <td style={{ padding: '9px 14px', borderBottom: `1px solid ${border}`, color: muted }}>{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: '12px', fontSize: '13.5px', color: muted }}>
              These services operate under their own privacy policies. We only share the minimum data necessary for
              these services to function (e.g., study notes text is sent to AI for MCQ generation — no personal data is included).
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>We use only <strong>strictly necessary cookies</strong> for platform operation:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <Li><strong>Authentication token:</strong> Keeps you logged in during your session</Li>
              <Li><strong>Theme preference:</strong> Remembers your light/dark mode choice</Li>
            </ul>
            <p style={{ marginTop: '10px', color: muted, fontSize: '13.5px' }}>
              We do not use cookies for advertising, tracking, or analytics. You can disable cookies in your browser settings,
              but this may affect your ability to log in.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p>
              Tassy Point is intended for users aged <strong>16 and above</strong> (primarily college students and working professionals
              preparing for competitive exams). We do not knowingly collect personal information from children under 13.
              If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p style={{ marginBottom: '10px' }}>You have the following rights regarding your personal data:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <Li><strong>Access:</strong> Request a copy of the data we hold about you</Li>
              <Li><strong>Correction:</strong> Update your profile information at any time via account settings</Li>
              <Li><strong>Deletion:</strong> Request deletion of your account and all associated data</Li>
              <Li><strong>Portability:</strong> Request your data in a portable format</Li>
              <Li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</Li>
            </ul>
            <p style={{ marginTop: '12px', fontSize: '13.5px', color: muted }}>
              To exercise any of these rights, contact us at the email below. We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Data Retention">
            <ul style={{ paddingLeft: '20px' }}>
              <Li>Account data is retained as long as your account is active</Li>
              <Li>If you delete your account, all personal data is permanently removed within <strong>30 days</strong></Li>
              <Li>Anonymised usage statistics may be retained indefinitely for platform improvement</Li>
            </ul>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make significant changes, we will notify
              users via a banner on the platform or via email. The "Last Updated" date at the top of this page
              will always reflect the most recent revision. Continued use of the platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
            <div style={{ marginTop: '14px', padding: '16px 20px', background: isDark ? '#1a2e3a' : '#f0f9ff', borderRadius: '10px', border: `1px solid ${border}` }}>
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>🌱 Tassy Point — AgriLearn</p>
              <p style={{ color: muted, fontSize: '14px' }}>📧 Email: <a href="mailto:support@tassypoint.in" style={{ color: '#0369a1' }}>support@tassypoint.in</a></p>
              <p style={{ color: muted, fontSize: '14px' }}>🌐 Website: <a href="https://agrilearn-4qhy.onrender.com" style={{ color: '#0369a1' }}>agrilearn-4qhy.onrender.com</a></p>
              <p style={{ color: muted, fontSize: '14px' }}>📍 India</p>
            </div>
          </Section>

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '20px', textAlign: 'center', color: muted, fontSize: '13px' }}>
            © 2025 Tassy Point. All rights reserved. &nbsp;|&nbsp; This platform is free for all agriculture students in India.
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, cursor: 'pointer', fontSize: '14px', color: text }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}
