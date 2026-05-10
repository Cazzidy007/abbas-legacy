'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']

const QUOTE = {
  text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
  translation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
  author: "Krishna — Bhagavad Gita, Chapter 2, Verse 47"
}

function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildCalendarDays(offset: number): Date[] {
  const days: Date[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i - offset)
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
  }
  return days
}

function KalmaIcon() {
  return (
    <svg width="680" height="48" viewBox="0 0 680 48" xmlns="http://www.w3.org/2000/svg">
      <text x="340" y="36" textAnchor="middle" fontFamily="'Reem Kufi', sans-serif" fontSize="30" fontWeight="700" fill="#111">
        لَا إِلٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ عَلِيٌّ وَلِيُّ ٱللَّٰهِ
      </text>
    </svg>
  )
}

const hrStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #2a2a2a',
  margin: '0',
  padding: '0',
  height: '0',
  width: '100%',
}

export default function Home() {
  const router = useRouter()
  const [habits, setHabits] = useState<any[]>([])
  const [completions, setCompletions] = useState<Record<string, Set<string>>>({})
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [addingHabit, setAddingHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [windowOffset, setWindowOffset] = useState(0)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const today = localDateStr()
  const calendarDays = buildCalendarDays(windowOffset)
  const maxOffset = 351
  const canGoBack = windowOffset < maxOffset
  const canGoForward = windowOffset > 0

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else { setUser(session.user); fetchData(session.user) }
    })
  }, [])

  async function fetchData(currentUser: any) {
    const { data: habitData } = await supabase
      .from('habits').select('*')
      .eq('user_id', currentUser.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    setHabits(habitData || [])

    if (habitData && habitData.length > 0) {
      const habitIds = habitData.map((h: any) => h.id)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 364)
      const cutoffStr = localDateStr(cutoff)

      const { data: completionData } = await supabase
        .from('completions').select('habit_id, completed_date')
        .in('habit_id', habitIds)
        .gte('completed_date', cutoffStr)

      const map: Record<string, Set<string>> = {}
      habitIds.forEach((id: string) => { map[id] = new Set() })
      ;(completionData || []).forEach((c: any) => {
        if (map[c.habit_id]) map[c.habit_id].add(c.completed_date)
      })
      setCompletions(map)

      const { count } = await supabase
        .from('completions').select('*', { count: 'exact', head: true })
        .in('habit_id', habitIds)
      setTotalCount(count || 0)
    }

    setLoading(false)
  }

  async function toggleDay(habitId: string, dateStr: string) {
    if (dateStr > today) return
    const isDone = completions[habitId]?.has(dateStr)

    if (isDone) {
      await supabase.from('completions').delete()
        .eq('habit_id', habitId).eq('completed_date', dateStr)
      setTotalCount(prev => prev - 1)
    } else {
      await supabase.from('completions').insert({ habit_id: habitId, completed_date: dateStr })
      setTotalCount(prev => prev + 1)
    }

    const newMap = { ...completions }
    const newSet = new Set(completions[habitId] || [])
    if (isDone) newSet.delete(dateStr); else newSet.add(dateStr)
    newMap[habitId] = newSet
    setCompletions(newMap)
  }

  async function addHabit() {
    if (!newHabitName.trim() || !user) return
    const { data } = await supabase.from('habits')
      .insert({ user_id: user.id, title: newHabitName.trim() })
      .select().single()
    if (data) {
      setHabits(prev => [...prev, data])
      setCompletions(prev => ({ ...prev, [data.id]: new Set() }))
    }
    setNewHabitName('')
    setAddingHabit(false)
  }

  async function confirmDelete(habitId: string) {
    await supabase.from('habits').delete().eq('id', habitId)
    setHabits(prev => prev.filter((h: any) => h.id !== habitId))
    const newMap = { ...completions }
    delete newMap[habitId]
    setCompletions(newMap)
    setConfirmDeleteId(null)
  }

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={styles.loader} />
    </div>
  )

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <main style={styles.page}>

      <header style={styles.header}>
        <span style={styles.logo}>Zulfiqar's Legacy</span>
        <KalmaIcon />
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={styles.totalBadge}>
            <span style={styles.totalNumber}>{totalCount}</span>
            <span style={styles.totalLabel}>total</span>
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            style={styles.ghostBtn}
          >sign out</button>
        </div>
      </header>

      <hr style={hrStyle} />

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.habitCol} />
              {calendarDays.map((d) => {
                const dateStr = localDateStr(d)
                const isToday = dateStr === today
                return (
                  <th key={dateStr} style={styles.dayCol}>
                    <div style={styles.dayHeader}>
                      <span style={styles.monthLabel}>{MONTHS[d.getMonth()]}</span>
                      <span style={{ ...styles.dateCircle, ...(isToday ? styles.todayCircle : {}) }}>
                        {d.getDate()}
                      </span>
                      <span style={styles.dayLabel}>{DAYS[d.getDay()]}</span>
                    </div>
                  </th>
                )
              })}
              <th style={styles.navCol}>
                <div style={styles.navButtons}>
                  <button
                    onClick={() => setWindowOffset(prev => Math.min(prev + 14, maxOffset))}
                    disabled={!canGoBack}
                    style={{ ...styles.navBtn, opacity: canGoBack ? 1 : 0.2 }}
                  >‹</button>
                  <button
                    onClick={() => setWindowOffset(prev => Math.max(prev - 14, 0))}
                    disabled={!canGoForward}
                    style={{ ...styles.navBtn, opacity: canGoForward ? 1 : 0.2 }}
                  >›</button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit: any) => (
              <tr key={habit.id} style={styles.row}>
                <td style={styles.habitNameCell}>
                  {confirmDeleteId === habit.id ? (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmText}>delete?</span>
                      <button onClick={() => confirmDelete(habit.id)} style={styles.confirmYes}>yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} style={styles.confirmNo}>no</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setConfirmDeleteId(habit.id)}
                        style={styles.deleteBtn}
                        title="delete habit"
                      >×</button>
                      <span
                        onClick={() => router.push(`/habit/${habit.id}`)}
                        style={styles.habitName}
                      >{habit.title}</span>
                    </div>
                  )}
                </td>
                {calendarDays.map((d) => {
                  const dateStr = localDateStr(d)
                  const isFuture = dateStr > today
                  const isDone = completions[habit.id]?.has(dateStr)
                  return (
                    <td key={dateStr} style={{ textAlign: 'center', padding: '5px 3px' }}>
                      <button
                        onClick={() => toggleDay(habit.id, dateStr)}
                        disabled={isFuture}
                        style={{
                          ...styles.checkbox,
                          ...(isDone ? styles.checkboxDone : {}),
                          ...(isFuture ? styles.checkboxFuture : {}),
                        }}
                      >
                        {isDone && (
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </td>
                  )
                })}
                <td />
              </tr>
            ))}

            <tr style={styles.row}>
              <td style={{ padding: '6px 0' }}>
                {addingHabit ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      autoFocus
                      value={newHabitName}
                      onChange={e => setNewHabitName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') addHabit()
                        if (e.key === 'Escape') setAddingHabit(false)
                      }}
                      placeholder="name your habit..."
                      style={styles.input}
                    />
                    <button onClick={addHabit} style={styles.addConfirmBtn}>add</button>
                    <button onClick={() => setAddingHabit(false)} style={styles.ghostBtn}>cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingHabit(true)} style={styles.newHabitBtn}>
                    + new habit
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {windowOffset > 0 && (
        <p style={styles.windowLabel}>
          {localDateStr(calendarDays[0])} — {localDateStr(calendarDays[13])}
          {' · '}
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setWindowOffset(0)}>
            back to today
          </span>
        </p>
      )}

      <hr style={{ ...hrStyle, marginTop: '32px' }} />

      <div style={styles.quoteSection}>
        <div style={styles.quoteCard}>
          <div style={styles.quoteOrnament}>✦</div>
          <p style={styles.quoteText}>{QUOTE.text}</p>
          <p style={styles.quoteTranslation}>{QUOTE.translation}</p>
          <p style={styles.quoteAuthor}>— {QUOTE.author}</p>
          <p style={styles.quoteDate}>{dateLabel}</p>
        </div>
      </div>

      <hr style={{ ...hrStyle, marginTop: '40px' }} />
      <p style={styles.createdBy}>created by Zulfiqar</p>

    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    padding: '32px 96px',
    maxWidth: '100%',
    margin: '0',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  logo: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: '1.9rem',
    fontWeight: '700',
    color: '#111',
    letterSpacing: '-0.01em',
    flexShrink: 0,
  },
  totalBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    lineHeight: 1,
    flexShrink: 0,
  },
  totalNumber: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111',
    letterSpacing: '-0.02em',
  },
  totalLabel: {
    fontSize: '9px',
    color: '#999',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginTop: '3px',
  },
  table: {
    borderCollapse: 'collapse' as const,
    width: '100%',
  },
  habitCol: {
    width: '220px',
    minWidth: '220px',
    textAlign: 'left' as const,
  },
  dayCol: {
    textAlign: 'center' as const,
    padding: '0 2px 14px',
    minWidth: '48px',
  },
  navCol: {
    width: '72px',
    minWidth: '72px',
    textAlign: 'center' as const,
    padding: '0 0 14px 4px',
  },
  navButtons: {
    display: 'flex',
    gap: '2px',
    justifyContent: 'center',
  },
  navBtn: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#555',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  dayHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '3px',
  },
  monthLabel: {
    fontSize: '9px',
    color: '#bbb',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  dateCircle: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#111',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  todayCircle: {
    background: '#111',
    color: '#fff',
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: '8px',
    color: '#ccc',
    letterSpacing: '0.06em',
  },
  row: {
    borderTop: '1px solid #f2f2f2',
  },
  habitNameCell: {
    padding: '6px 24px 6px 0',
  },
  habitName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#111',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  confirmText: {
    fontSize: '12px',
    color: '#888',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  confirmYes: {
    fontSize: '12px',
    color: '#fff',
    background: '#111',
    border: 'none',
    borderRadius: '4px',
    padding: '3px 10px',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
    fontWeight: '600',
  },
  confirmNo: {
    fontSize: '12px',
    color: '#999',
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '3px 10px',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '5px',
    border: '1.5px solid #e0e0e0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    transition: 'all 0.12s ease',
    padding: 0,
  },
  checkboxDone: {
    background: '#111',
    border: '1.5px solid #111',
  },
  checkboxFuture: {
    border: '1.5px solid #f0f0f0',
    cursor: 'not-allowed',
    background: '#fafafa',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#e0e0e0',
    fontSize: '18px',
    lineHeight: 1,
    padding: '0 2px',
    borderRadius: '4px',
    fontFamily: 'sans-serif',
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  ghostBtn: {
    fontSize: '12px',
    color: '#aaa',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  newHabitBtn: {
    fontSize: '13px',
    color: '#c0c0c0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
    padding: 0,
  },
  input: {
    border: 'none',
    borderBottom: '1.5px solid #111',
    outline: 'none',
    fontSize: '14px',
    color: '#111',
    background: 'transparent',
    width: '200px',
    fontFamily: "'Reem Kufi', sans-serif",
    padding: '2px 0',
  },
  addConfirmBtn: {
    fontSize: '13px',
    color: '#111',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  loader: {
    width: '24px',
    height: '24px',
    border: '2px solid #f0f0f0',
    borderTop: '2px solid #111',
    borderRadius: '50%',
  },
  windowLabel: {
    fontSize: '11px',
    color: '#ccc',
    textAlign: 'center' as const,
    marginTop: '16px',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  quoteSection: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  quoteCard: {
    width: '100%',
    maxWidth: '680px',
    border: '1px solid #e8e8e8',
    borderRadius: '2px',
    padding: '40px 48px',
    textAlign: 'center' as const,
  },
  quoteOrnament: {
    fontSize: '14px',
    color: '#ccc',
    marginBottom: '20px',
    letterSpacing: '8px',
  },
  quoteText: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#111',
    lineHeight: 1.8,
    margin: '0 0 16px 0',
    letterSpacing: '0.02em',
  },
  quoteTranslation: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: '14px',
    fontStyle: 'italic' as const,
    color: '#555',
    lineHeight: 1.7,
    margin: '0 0 16px 0',
    letterSpacing: '0.01em',
  },
  quoteAuthor: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: '13px',
    color: '#888',
    margin: '0 0 16px 0',
    letterSpacing: '0.06em',
  },
  quoteDate: {
    fontFamily: "'Reem Kufi', sans-serif",
    fontSize: '10px',
    color: '#ccc',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    margin: 0,
    borderTop: '1px solid #f0f0f0',
    paddingTop: '14px',
  },
  createdBy: {
    textAlign: 'right' as const,
    fontSize: '11px',
    color: '#bbb',
    fontFamily: "'Reem Kufi', sans-serif",
    margin: '12px 0 0 0',
    letterSpacing: '0.04em',
  },
}