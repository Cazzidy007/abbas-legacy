'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT']

const QUOTES = [
  { text: "Do not let your difficulties fill you with anxiety, after all it is only in the darkest nights that stars shine more brightly.", author: "Ali ibn Abi Talib" },
  { text: "The strongest among you is the one who controls his anger.", author: "Ali ibn Abi Talib" },
  { text: "Silence is the best reply to a fool.", author: "Ali ibn Abi Talib" },
  { text: "He who has a thousand friends has not a friend to spare.", author: "Ali ibn Abi Talib" },
  { text: "Do not be a slave to others when God has created you free.", author: "Ali ibn Abi Talib" },
  { text: "Patience is of two kinds: patience over what pains you, and patience against what you covet.", author: "Ali ibn Abi Talib" },
  { text: "A moment of patience in a moment of anger saves a thousand moments of regret.", author: "Ali ibn Abi Talib" },
  { text: "Knowledge is better than wealth. Knowledge guards you, while you guard wealth.", author: "Ali ibn Abi Talib" },
  { text: "The tongue is like a lion. If you let it loose, it will wound someone.", author: "Ali ibn Abi Talib" },
  { text: "Forgive and you will be forgiven.", author: "Ali ibn Abi Talib" },
  { text: "Associate with people in such a manner that when you die, they weep for you, and while you are alive they long for your company.", author: "Ali ibn Abi Talib" },
  { text: "The most complete gift of God is a life based on knowledge.", author: "Ali ibn Abi Talib" },
  { text: "No honour is nobler than knowledge.", author: "Ali ibn Abi Talib" },
  { text: "Two things define you: your patience when you have nothing, and your attitude when you have everything.", author: "Ali ibn Abi Talib" },
  { text: "Be like the flower that gives its fragrance to even the hand that crushes it.", author: "Ali ibn Abi Talib" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Do not grieve. Everything you lose comes round in another form.", author: "Rumi" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "What hurts you, blesses you. Darkness is your candle.", author: "Rumi" },
  { text: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I will meet you there.", author: "Rumi" },
  { text: "Sell your cleverness and buy bewilderment.", author: "Rumi" },
  { text: "The quieter you become, the more you are able to hear.", author: "Rumi" },
  { text: "Let the beauty of what you love be what you do.", author: "Rumi" },
  { text: "Raise your words, not your voice. It is rain that grows flowers, not thunder.", author: "Rumi" },
  { text: "Live where you fear to live. Destroy your reputation. Be notorious.", author: "Rumi" },
  { text: "This human being is a guest house. Every morning a new arrival.", author: "Rumi" },
  { text: "The garden of the world has no limits, except in your mind.", author: "Rumi" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "Waste no more time arguing what a good person should be. Be one.", author: "Marcus Aurelius" },
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "Confine yourself to the present.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Do not go where the path may lead; go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "You are never too old to set another goal or dream a new dream.", author: "C.S. Lewis" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Vision without action is daydream. Action without vision is nightmare.", author: "Japanese Proverb" },
  { text: "He who knows others is wise; he who knows himself is enlightened.", author: "Lao Tzu" },
  { text: "To the mind that is still, the whole universe surrenders.", author: "Lao Tzu" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The noblest pleasure is the joy of understanding.", author: "Leonardo da Vinci" },
  { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "We must be the change we wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "The weak can never forgive. Forgiveness is the attribute of the strong.", author: "Mahatma Gandhi" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "If you judge people, you have no time to love them.", author: "Mother Teresa" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "There is nothing permanent except change.", author: "Heraclitus" },
  { text: "Character is destiny.", author: "Heraclitus" },
  { text: "No man ever steps in the same river twice, for it's not the same river and he's not the same man.", author: "Heraclitus" },
  { text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.", author: "Socrates" },
  { text: "Education is the kindling of a flame, not the filling of a vessel.", author: "Socrates" },
  { text: "By failing to prepare, you are preparing to fail.", author: "Benjamin Franklin" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Give me six hours to chop down a tree and I will spend the first four sharpening the axe.", author: "Abraham Lincoln" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "The most wasted of all days is one without laughter.", author: "e.e. cummings" },
]

function getDailyQuote() {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const month = now.getMonth()
  const seed = dayOfMonth * 3 + month * 7
  return QUOTES[seed % QUOTES.length]
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
  const quote = getDailyQuote()

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
          <p style={styles.quoteText}>"{quote.text}"</p>
          <p style={styles.quoteAuthor}>— {quote.author}</p>
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
    fontSize: '18px',
    fontWeight: '500',
    color: '#111',
    lineHeight: 1.75,
    margin: '0 0 20px 0',
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