import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function TermsPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const accent = '#194552'

  const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontSize: '16px', fontWeight: '700', color: '#fff',
        background: `linear-gradient(90deg, ${accent}, #0d6e84)`,
        padding: '10px 16px', borderRadius: '8px', marginBottom: '14px'
      }}>{num}. {title}</h2>
      <div style={{ fontSize: '14.5px', lineHeight: '1.85', color: text }}>{children}</div>
    </div>
  )

  const Li = ({ children }: { children: React.ReactNode }) => (
    <li style={{ marginBottom: '6px', paddingLeft: '6px' }}>{children}</li>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #0d6e84 100%)`, padding: '48px 16px', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📜</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Terms & Conditions</h1>
          <p style={{ color: '#9ecfda', fontSize: '15px' }}>Tassy Point — AgriLearn Platform</p>
          <p style={{ color: '#9ecfda', fontSize: '13px', marginTop: '6px' }}>Effective Date: June 27, 2025 &nbsp;|&nbsp; Last Updated: June 27, 2025</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Intro */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '14.5px', lineHeight: '1.85', color: text }}>
            Please read these Terms and Conditions carefully before using <strong>Tassy Point</strong> (the "Platform").
            By accessing or using our website or mobile application, you agree to be bound by these Terms.
            If you do not agree, please do not use the Platform.
          </p>
          <p style={{ fontSize: '14.5px', lineHeight: '1.85', color: text, marginTop: '10px' }}>
            These Terms constitute a legally binding agreement between you and <strong>Tassy Point</strong> ("we", "us", "our").
          </p>
        </div>

        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '28px' }}>

          <Section num="1" title="Acceptance of Terms">
            <p>By registering an account or using any part of the Tassy Point platform, you confirm that:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <Li>You are at least <strong>16 years of age</strong></Li>
              <Li>You have read and understood these Terms</Li>
              <Li>You agree to comply with all applicable laws and regulations</Li>
              <Li>The information you provide during registration is accurate and truthful</Li>
            </ul>
          </Section>

          <Section num="2" title="Description of Service">
            <p>Tassy Point is a <strong>free educational platform</strong> designed to help students and professionals prepare for competitive agricultural examinations in India, including but not limited to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <Li>UPCATET (Uttar Pradesh Combined Agriculture & Technology Entrance Test)</Li>
              <Li>IBPS AFO (Agriculture Field Officer)</Li>
              <Li>FCI (Food Corporation of India)</Li>
              <Li>UPSSSC and other state-level agriculture recruitment exams</Li>
            </ul>
            <p style={{ marginTop: '12px' }}>Our services include study notes, video lectures, AI-generated MCQ tests, exam information, and community features.</p>
          </Section>

          <Section num="3" title="User Accounts">
            <p style={{ marginBottom: '10px' }}>When you create an account on Tassy Point:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <Li>You are responsible for maintaining the <strong>confidentiality of your password</strong></Li>
              <Li>You are responsible for all activities that occur under your account</Li>
              <Li>You must notify us immediately of any unauthorised use of your account</Li>
              <Li>You may not create accounts for others without their permission</Li>
              <Li>One person may not maintain more than one active account</Li>
            </ul>
            <p style={{ marginTop: '12px', padding: '12px 16px', background: isDark ? '#2d1a1a' : '#fff5f5', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              ⚠️ We reserve the right to <strong>suspend or terminate accounts</strong> that violate these Terms.
            </p>
          </Section>

          <Section num="4" title="Acceptable Use Policy">
            <p style={{ marginBottom: '10px' }}>You agree <strong>NOT</strong> to:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <Li>Copy, redistribute, or resell any content from Tassy Point without written permission</Li>
              <Li>Use the platform for any unlawful or fraudulent purpose</Li>
              <Li>Attempt to hack, probe, or disrupt our servers or infrastructure</Li>
              <Li>Upload or share content that is offensive, abusive, defamatory, or obscene</Li>
              <Li>Impersonate any person or entity</Li>
              <Li>Use automated bots or scrapers to extract content</Li>
              <Li>Misuse AI-generated content — questions are for personal study only</Li>
            </ul>
          </Section>

          <Section num="5" title="Intellectual Property">
            <p>All content on Tassy Point — including study notes, MCQ questions, AI-generated content, logos, design, and code — is the <strong>intellectual property of Tassy Point</strong> or its respective content providers.</p>
            <p style={{ marginTop: '10px' }}>You are granted a <strong>limited, non-exclusive, non-transferable licence</strong> to access and use the content for personal, non-commercial educational purposes only.</p>
            <p style={{ marginTop: '10px' }}>You may <strong>not</strong> reproduce, distribute, publish, or create derivative works from our content without explicit written consent.</p>
          </Section>

          <Section num="6" title="AI-Generated Content">
            <p>Tassy Point uses AI technology (including GitHub Models / OpenAI) to generate MCQ questions and format exam information. Please note:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <Li>AI-generated content may occasionally contain <strong>errors or inaccuracies</strong></Li>
              <Li>All AI-generated MCQs should be treated as <strong>practice material only</strong></Li>
              <Li>We do not guarantee the accuracy of AI-generated content</Li>
              <Li>We are continuously improving our AI systems to enhance quality</Li>
            </ul>
          </Section>

          <Section num="7" title="Free Platform & No Warranties">
            <p>Tassy Point is provided <strong>free of charge</strong>. The platform is provided on an <strong>"as is" and "as available"</strong> basis without warranties of any kind, either express or implied.</p>
            <p style={{ marginTop: '10px' }}>We do not warrant that:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <Li>The platform will be uninterrupted or error-free</Li>
              <Li>The content will be always accurate, complete, or up-to-date</Li>
              <Li>Using our platform will guarantee success in any examination</Li>
            </ul>
          </Section>

          <Section num="8" title="Limitation of Liability">
            <p>To the maximum extent permitted by applicable law, Tassy Point and its team shall not be liable for:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <Li>Any indirect, incidental, or consequential damages arising from your use of the platform</Li>
              <Li>Loss of data, exam results, or academic outcomes</Li>
              <Li>Any content posted by other users on community features</Li>
              <Li>Temporary unavailability of the platform</Li>
            </ul>
          </Section>

          <Section num="9" title="Third-Party Links & Services">
            <p>The platform may contain links to third-party websites (e.g., YouTube for video lectures, official exam websites). These links are provided for convenience only. We are not responsible for the content, privacy practices, or availability of third-party sites.</p>
          </Section>

          <Section num="10" title="Termination">
            <p>We reserve the right to <strong>suspend or permanently terminate</strong> your access to the platform at our discretion if you violate these Terms. You may also close your account at any time by contacting us.</p>
            <p style={{ marginTop: '10px' }}>Upon termination, your right to use the platform ceases immediately. Provisions relating to intellectual property, disclaimers, and limitations of liability shall survive termination.</p>
          </Section>

          <Section num="11" title="Governing Law">
            <p>These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of <strong>Uttar Pradesh, India</strong>.</p>
          </Section>

          <Section num="12" title="Changes to Terms">
            <p>We may revise these Terms at any time. We will notify users of significant changes via a platform notification or email. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.</p>
          </Section>

          <Section num="13" title="Contact Us">
            <p>For any questions regarding these Terms and Conditions:</p>
            <div style={{ marginTop: '14px', padding: '16px 20px', background: isDark ? '#1a2e3a' : '#f0f9ff', borderRadius: '10px', border: `1px solid ${border}` }}>
              <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px' }}>🌱 Tassy Point — AgriLearn</p>
              <p style={{ color: muted, fontSize: '14px' }}>📧 <a href="mailto:support@tassypoint.in" style={{ color: '#0369a1' }}>support@tassypoint.in</a></p>
              <p style={{ color: muted, fontSize: '14px' }}>🌐 <a href="https://agrilearn-4qhy.onrender.com" style={{ color: '#0369a1' }}>agrilearn-4qhy.onrender.com</a></p>
            </div>
          </Section>

          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '20px', textAlign: 'center', color: muted, fontSize: '13px' }}>
            © 2025 Tassy Point. All rights reserved.
          </div>
        </div>

        <button onClick={() => navigate(-1)} style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, cursor: 'pointer', fontSize: '14px', color: text }}>
          ← Go Back
        </button>
      </div>
    </div>
  )
}
