'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

export default function HabitDetail() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [habit, setHabit] = useState<any>(null)
  const [completions, setCompletions] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const today = localDateStr()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: habitData } = await supabase
      .from('habits').select('*').eq('id', id).single()

    if (habitData) {
      setHabit(habitData)
      setTitleValue(habitData.title)

      const { data: completionData } = await supabase
        .from('completions').select('completed_date')
        .eq('habit_id', habitData.id)
        .order('completed_date', { ascending: false })

      const dateSet = new Set<string>((completionData || []).map((c: any) => c.completed_date))
      setCompletions(dateSet)
      setTotalCount(dateSet.size)

      const { data: statsData } = await supabase
        .rpc('get_habit_stats', { p_habit_id: habitData.id })
      setStats(statsData)
    }
    setLoading(false)
  }

  async function saveTitle() {
    if (!titleValue.trim()) return
    await supabase.from('habits').update({ title: titleValue.trim() }).eq('id', id)
    setHabit((prev: any) => ({ ...prev, title: titleValue.trim() }))
    setEditingTitle(false)
  }

  async function toggleDay(dateStr: string) {
    if (dateStr > today) return
    const isDone = completions.has(dateStr)

    if (isDone) {
      await supabase.from('completions').delete()
        .eq('habit_id', id).eq('completed_date', dateStr)
      const next = new Set(completions)
      next.delete(dateStr)
      setCompletions(next)
      setTotalCount(prev => prev - 1)
    } else {
      await supabase.from('completions').insert({ habit_id: id, completed_date: dateStr })
      const next = new Set(completions)
      next.add(dateStr)
      setCompletions(next)
      setTotalCount(prev => prev + 1)
    }

    const { data: statsData } = await supabase
      .rpc('get_habit_stats', { p_habit_id: id })
    setStats(statsData)
  }

  if (!mounted || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={styles.loader} />
    </div>
  )

  const days: string[] = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(localDateStr(d))
  }

  const statItems = stats ? [
    { label: 'Current streak', value: stats.current_streak, suffix: 'days' },
    { label: 'Longest streak', value: stats.longest_streak, suffix: 'days' },
    { label: 'Total count', value: stats.total, suffix: 'days' },
    { label: 'Completion rate', value: `${stats.yearly_rate}%`, suffix: 'since first tick' },
  ] : []

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
          <button onClick={() => router.push('/')} style={styles.backBtn}>← back</button>
        </div>
      </header>

      <div style={styles.divider} />

      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        {editingTitle ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveTitle()
                if (e.key === 'Escape') setEditingTitle(false)
              }}
              style={styles.titleInput}
            />
            <button onClick={saveTitle} style={styles.saveBtn}>save</button>
            <button onClick={() => setEditingTitle(false)} style={styles.ghostBtn}>cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h2 style={styles.habitTitle}>{habit?.title}</h2>
            <button onClick={() => setEditingTitle(true)} style={styles.editBtn}>edit</button>
          </div>
        )}
      </div>

      {stats && (
        <div style={styles.statsGrid}>
          {statItems.map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statSuffix}>{s.suffix}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <p style={styles.sectionLabel}>past year — click any day to toggle</p>
        <div style={styles.heatmap}>
          {days.map(date => {
            const isFuture = date > today
            const isDone = completions.has(date)
            const isToday = date === today
            return (
              <div
                key={date}
                title={date}
                onClick={() => !isFuture && toggleDay(date)}
                style={{
                  ...styles.heatCell,
                  background: isDone ? '#111' : '#f0f0f0',
                  outline: isToday ? '2px solid #111' : 'none',
                  outlineOffset: '1px',
                  cursor: isFuture ? 'default' : 'pointer',
                  opacity: isFuture ? 0.3 : 1,
                }}
              />
            )
          })}
        </div>
      </div>

      <footer style={styles.footer}>
        <div style={styles.divider} />
        <p style={styles.createdBy}>created by Zulfiqar</p>
      </footer>

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
  divider: {
    height: '1px',
    background: '#2a2a2a',
    margin: '0',
  },
  footer: {
    marginTop: '40px',
  },
  createdBy: {
    textAlign: 'right' as const,
    fontSize: '11px',
    color: '#bbb',
    fontFamily: "'Reem Kufi', sans-serif",
    margin: '12px 0 0 0',
    letterSpacing: '0.04em',
  },
  backBtn: {
    fontSize: '13px',
    color: '#111',
    background: 'none',
    border: '1px solid #111',
    borderRadius: '6px',
    padding: '6px 16px',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  habitTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111',
    margin: 0,
    fontFamily: "'Reem Kufi', sans-serif",
  },
  editBtn: {
    fontSize: '12px',
    color: '#ccc',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  titleInput: {
    border: 'none',
    borderBottom: '1.5px solid #111',
    outline: 'none',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111',
    background: 'transparent',
    fontFamily: "'Reem Kufi', sans-serif",
    width: '100%',
    maxWidth: '480px',
  },
  saveBtn: {
    fontSize: '13px',
    color: '#111',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  ghostBtn: {
    fontSize: '12px',
    color: '#aaa',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Reem Kufi', sans-serif",
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: {
    padding: '20px 14px',
    border: '1px solid #ebebeb',
    borderRadius: '10px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111',
    fontFamily: "'Reem Kufi', sans-serif",
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '10px',
    color: '#999',
    marginTop: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  statSuffix: {
    fontSize: '9px',
    color: '#ccc',
    marginTop: '3px',
    letterSpacing: '0.04em',
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#bbb',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '10px',
  },
  heatmap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '3px',
  },
  heatCell: {
    width: '13px',
    height: '13px',
    borderRadius: '2px',
    transition: 'background 0.1s',
  },
  loader: {
    width: '24px',
    height: '24px',
    border: '2px solid #f0f0f0',
    borderTop: '2px solid #111',
    borderRadius: '50%',
  },
}