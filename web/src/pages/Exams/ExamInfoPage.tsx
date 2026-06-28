import { useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'

export default function ExamInfoPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const { data: exams = [], isLoading } = useQuery('exams', examApi.getAll, {
    select: res => res.data,
  })

  const { data: sections = [], isLoading: sectionsLoading } = useQuery(
    ['exam-sections', selectedExamId],
    () => examApi.getSections(selectedExamId!),
    { select: res => res.data, enabled: !!selectedExamId }
  )

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'
  const tableBorder = isDark ? '#374151' : '#d1d5db'
  const tableHeaderBg = isDark ? '#1f2937' : '#f3f4f6'

  const parseJson = (str: string | null) => {
    if (!str) return null
    try { return JSON.parse(str) } catch { return null }
  }

  const selectedExam = exams.find((e: any) => e.id === selectedExamId)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg }}>
      {/* Header */}
      <div style={{ backgroundColor: headerBg, padding: '28px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>📋 Exam Information</h1>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            Eligibility criteria, exam pattern, syllabus and important dates
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Exam selector */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: text, marginBottom: '14px' }}>
            Select an Exam
          </h2>
          {isLoading ? (
            <div style={{ color: muted }}>Loading exams...</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {exams.map((exam: any) => (
                <button
                  key={exam.id}
                  onClick={() => { setSelectedExamId(exam.id); setExpandedSection(null) }}
                  style={{
                    padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    backgroundColor: selectedExamId === exam.id ? '#194552' : (isDark ? '#374151' : '#f3f4f6'),
                    color: selectedExamId === exam.id ? '#fff' : text,
                    border: `2px solid ${selectedExamId === exam.id ? '#194552' : border}`,
                  }}
                >
                  {exam.icon && <img src={exam.icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain', marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} onError={(e: any) => { e.target.style.display = 'none' }} />}
                  {exam.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exam Info Content */}
        {selectedExamId && (
          <div>
            {/* Exam title bar */}
            <div style={{ backgroundColor: headerBg, borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '16px' }}>
              {selectedExam?.icon && (
                <img src={selectedExam.icon} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '4px' }}
                  onError={(e: any) => { e.target.style.display = 'none' }} />
              )}
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>{selectedExam?.name}</h2>
                {selectedExam?.description && (
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>{selectedExam.description}</p>
                )}
              </div>
            </div>

            {sectionsLoading ? (
              <div style={{ color: muted, padding: '20px' }}>Loading exam information...</div>
            ) : sections.length === 0 ? (
              <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p style={{ color: muted, fontSize: '15px' }}>No exam information available yet for this exam.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sections.map((section: any, idx: number) => {
                  const headers = parseJson(section.tableHeaders) as string[] | null
                  const rows = parseJson(section.tableRows) as string[][] | null
                  const isOpen = expandedSection === idx

                  return (
                    <div key={section.id} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' }}>
                      {/* Section header */}
                      <button
                        onClick={() => setExpandedSection(isOpen ? null : idx)}
                        style={{
                          width: '100%', padding: '16px 20px', backgroundColor: isDark ? '#1a2e3a' : '#e8f4f8',
                          border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: '700', fontSize: '15px', color: text }}>{section.title || section.sectionTitle}</span>
                        {isOpen
                          ? <ChevronUp style={{ width: '18px', height: '18px', color: muted }} />
                          : <ChevronDown style={{ width: '18px', height: '18px', color: muted }} />}
                      </button>

                      {/* Section content */}
                      {isOpen && section.sectionType === 'DOC' && section.description && (
                        <>
                          {isDark && (
                            <style>{`
                              .exam-doc-content { color: #f9fafb !important; background: transparent !important; }
                              .exam-doc-content * { color: #e5e7eb !important; background-color: transparent !important; border-color: #374151 !important; }
                              .exam-doc-content h1,.exam-doc-content h2,.exam-doc-content h3,.exam-doc-content h4 { color: #f9fafb !important; }
                              .exam-doc-content a { color: #34d399 !important; }
                              .exam-doc-content table { border-collapse: collapse !important; width: 100% !important; }
                              .exam-doc-content th { background-color: #1f2937 !important; color: #f9fafb !important; border: 1px solid #374151 !important; padding: 8px 12px !important; }
                              .exam-doc-content td { border: 1px solid #374151 !important; padding: 8px 12px !important; color: #e5e7eb !important; }
                              .exam-doc-content tr:nth-child(even) td { background-color: #1f2937 !important; }
                              .exam-doc-content strong, .exam-doc-content b { color: #f9fafb !important; }
                              .exam-doc-content blockquote { border-left: 3px solid #374151 !important; color: #9ca3af !important; }
                            `}</style>
                          )}
                          <div
                            className={`prose prose-slate max-w-none ${isDark ? 'prose-invert' : ''} exam-doc-content`}
                            style={{ padding: '24px', overflowX: 'auto', color: text, backgroundColor: 'transparent' }}
                            dangerouslySetInnerHTML={{ __html: section.description }}
                          />
                        </>
                      )}
                      {isOpen && section.sectionType !== 'DOC' && section.description && (
                        <div style={{ padding: '12px 20px 0', fontSize: '14px', color: text, lineHeight: '1.6' }}>
                          {section.description}
                        </div>
                      )}
                      {isOpen && section.sectionType !== 'DOC' && headers && rows && (
                        <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                              <tr>
                                {headers.map((h, hi) => (
                                  <th key={hi} style={{ padding: '10px 14px', textAlign: 'left', backgroundColor: tableHeaderBg, color: text, fontWeight: '700', border: `1px solid ${tableBorder}` }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, ri) => (
                                <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? 'transparent' : (isDark ? '#283747' : '#f9fafb') }}>
                                  {row.map((cell, ci) => (
                                    <td key={ci} style={{ padding: '10px 14px', border: `1px solid ${tableBorder}`, color: text, verticalAlign: 'top' }}>
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {!selectedExamId && !isLoading && (
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: text, marginBottom: '8px' }}>Select an exam above</h3>
            <p style={{ color: muted, fontSize: '14px' }}>View eligibility, exam pattern, syllabus and important dates</p>
          </div>
        )}
      </div>
    </div>
  )
}
