import { useEffect, useState } from 'react'
import { ArrowRight, Calendar, Check, CheckCircle, Clock, Download01, InfoCircle, Plus, RefreshCcw01, Settings01, Trash01 } from '@untitledui/icons'
import { Button } from './components/base/buttons/button'
import { Toggle } from './components/base/toggle/toggle'
import './App.css'

const DAYS = [
  { id: 'mon', name: 'Poniedziałek' }, { id: 'tue', name: 'Wtorek' },
  { id: 'wed', name: 'Środa' }, { id: 'thu', name: 'Czwartek' },
  { id: 'fri', name: 'Piątek' }, { id: 'sat', name: 'Sobota' },
]
const STORAGE_KEY = 'godzinka-calculator-v1'
const newEntry = () => ({ id: crypto.randomUUID(), start: '', end: '' })
const initialState = () => ({ saturday: false, days: Object.fromEntries(DAYS.map(day => [day.id, []])) })
function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!data || typeof data.saturday !== 'boolean') return initialState()
    if (!DAYS.every(day => Array.isArray(data.days?.[day.id]) && data.days[day.id].every(entry => entry && typeof entry.id === 'string' && [entry.start, entry.end].every(value => typeof value === 'string' && (value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(value)))))) return initialState()
    return { saturday: data.saturday, days: Object.fromEntries(DAYS.map(day => [day.id, data.days[day.id].map(({ id, start, end }) => ({ id, start, end }))])) }
  } catch { return initialState() }
}
const duration = minutes => `${Math.floor(minutes / 60)} godz.${minutes % 60 ? ` ${minutes % 60} min` : ''}`
const toMinutes = time => time.split(':').reduce((hours, minutes) => Number(hours) * 60 + Number(minutes))
function entryResult(entry) {
  if (!entry.start || !entry.end) return { actual: 0, valid: false, error: false }
  const actual = toMinutes(entry.end) - toMinutes(entry.start)
  if (actual <= 0) return { actual: 0, valid: false, error: true }
  return { actual, valid: true, error: false }
}

function App() {
  const [state, setState] = useState(loadState)
  const [storageError, setStorageError] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const visibleDays = DAYS.filter(day => day.id !== 'sat' || state.saturday)
  const summaries = visibleDays.map(day => {
    const results = state.days[day.id].map(entryResult)
    return { ...day, actual: results.reduce((sum, result) => sum + result.actual, 0), count: results.filter(result => result.valid).length }
  })
  const total = summaries.reduce((sum, day) => ({ actual: sum.actual + day.actual, count: sum.count + day.count }), { actual: 0, count: 0 })
  const incompleteCount = visibleDays.reduce((sum, day) => sum + state.days[day.id].filter(entry => !entryResult(entry).valid).length, 0)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false) }
    catch { setStorageError(true) }
  }, [state])
  const updateConfig = (key, value) => setState(previous => ({ ...previous, [key]: value }))
  const updateDay = (id, update) => setState(previous => ({ ...previous, days: { ...previous.days, [id]: update(previous.days[id]) } }))
  function exportSummary() {
    const lines = ['GODZINKA · PODSUMOWANIE TYGODNIA', '']
    for (const day of summaries) {
      lines.push(day.name)
      for (const entry of state.days[day.id]) {
        const result = entryResult(entry)
        if (result.valid) lines.push(`  ${entry.start}–${entry.end}: ${duration(result.actual)}`)
      }
      lines.push(`Razem: ${duration(day.actual)}`, '')
    }
    lines.push(`ŁĄCZNY CZAS: ${duration(total.actual)}`, `LICZBA ZAJĘĆ: ${total.count}`)
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'godzinka-podsumowanie.txt'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <>
    <header className="topbar"><a className="brand" href="#"><span className="brand-symbol"><Clock aria-hidden="true" /></span>godzinka<span className="brand-dot">.</span></a><span className="topbar-divider" /><span className="topbar-caption">Mniej liczenia. Więcej spokoju.</span><span className="private-label"><span />Twój czas, pod kontrolą</span></header>
    <main className="page">
      <div className="page-heading"><div><div className="eyebrow"><span />MAŁE NARZĘDZIE, DUŻA ULGA</div><h1>Każda godzina się liczy<span>.</span></h1><p>Dodaj godziny rozpoczęcia i zakończenia. Zobacz łączny czas zajęć.</p></div><div className="heading-icon" aria-hidden="true"><Clock /><span><Check /></span></div></div>
      <section className="settings card" aria-labelledby="settings-title">
        <div className="settings-heading"><span className="icon-box"><Settings01 /></span><div><h2 id="settings-title">Po Twojemu</h2><p>Ustaw raz. Resztę policzymy za Ciebie.</p></div><span className="small-label">KONFIGURACJA</span></div>
        <div className="settings-fields">
          <div className="saturday-setting"><div><span className="field-title">Uwzględnić sobotę?</span><p>Dodaj szósty dzień do swojego tygodnia.</p></div><Toggle aria-label="Pokazuj sobotę" size="md" isSelected={state.saturday} onChange={value => updateConfig('saturday', value)} /></div>
        </div>
      </section>
      <div className="workspace">
        <section className="week" aria-labelledby="week-title">
          <div className="section-heading"><div><h2 id="week-title">Twój tydzień <span className="badge neutral">{visibleDays.length} dni</span></h2><p>Każdy dzień to nowa przestrzeń na zajęcia.</p></div><span className="week-icon"><Calendar /></span></div>
          <div className="day-list">{summaries.map((day, dayIndex) => <section className="day-card card" key={day.id} aria-labelledby={`title-${day.id}`}>
            <div className="day-heading"><div className="day-title"><span className={`day-number ${day.count ? 'has-entries' : ''}`}>{String(dayIndex + 1).padStart(2, '0')}</span><h3 id={`title-${day.id}`}>{day.name}</h3>{day.count > 0 && <span className="badge neutral">{day.count} {day.count === 1 ? 'wpis' : day.count < 5 ? 'wpisy' : 'wpisów'}</span>}</div><Button color="link-color" iconLeading={Plus} onPress={() => updateDay(day.id, entries => [...entries, newEntry()])}>Dodaj zajęcia</Button></div>
            {state.days[day.id].length === 0 ? <div className="empty-day"><span className="empty-line" /><span>Jeszcze bez zajęć. Może chwila dla siebie?</span><span className="empty-line" /></div> : <div className="entries">{state.days[day.id].map((entry, index) => {
              const result = entryResult(entry)
              const changeEntry = (key, value) => updateDay(day.id, entries => entries.map(item => item.id === entry.id ? { ...item, [key]: value } : item))
              return <div className={`entry ${result.error ? 'invalid-entry' : ''}`} key={entry.id}>
                <div className="entry-top"><span className="entry-label">ZAJĘCIA {String(index + 1).padStart(2, '0')}</span><Button color="tertiary" iconLeading={Trash01} aria-label={`Usuń zajęcia ${index + 1}, ${day.name}`} onPress={() => updateDay(day.id, entries => entries.filter(item => item.id !== entry.id))} /></div>
                <div className="entry-fields"><label className="field"><span>Rozpoczęcie</span><input type="time" value={entry.start} aria-invalid={result.error} aria-describedby={result.error ? `error-${entry.id}` : undefined} onChange={event => changeEntry('start', event.target.value)} /></label><ArrowRight className="time-arrow" aria-hidden="true" /><label className="field"><span>Zakończenie</span><input type="time" value={entry.end} aria-invalid={result.error} aria-describedby={result.error ? `error-${entry.id}` : undefined} onChange={event => changeEntry('end', event.target.value)} /></label><div className="entry-duration"><Clock /><strong>{result.valid ? duration(result.actual) : '—'}</strong><span>{result.valid ? 'Czas zajęć' : 'Uzupełnij godziny'}</span></div></div>
                {result.error && <p className="field-error" id={`error-${entry.id}`} role="alert">Zakończenie musi być późniejsze niż rozpoczęcie w tym samym dniu.</p>}
              </div>
            })}</div>}
            <div className="day-footer"><span><Clock />Razem w tym dniu</span><div><strong>{duration(day.actual)}</strong></div></div>
          </section>)}</div>
          <div className="save-status" role="status">{storageError ? <InfoCircle /> : <CheckCircle />}<span>{storageError ? 'Zapis w przeglądarce jest niedostępny. Pobierz podsumowanie przed zamknięciem.' : 'Spokojnie, Twoje wpisy zapisują się automatycznie w tej przeglądarce.'}</span></div>
        </section>
        <aside className="summary-column">
          <section className="summary card" aria-labelledby="summary-title">
            <div className="summary-header"><span className="icon-box"><Calendar /></span><span className="badge purple">Cały tydzień</span></div><h2 id="summary-title">Wszystko się zgadza.</h2><p>Twój tydzień w kilku liczbach.</p>
            <div className="total-hours" aria-live="polite"><span>Łączny czas zajęć</span><div>{Math.floor(total.actual / 60)}<span>godz.</span> {total.actual % 60}<span>min</span></div><small><Clock />Suma czasu z całego tygodnia</small></div>
            <div className="day-breakdown">{summaries.map(day => <div key={day.id}><span>{day.name}</span><strong>{duration(day.actual)}</strong></div>)}</div>
            <div className="summary-meta"><span>Liczba zajęć</span><strong>{total.count}</strong></div>
            {incompleteCount > 0 && <p className="incomplete-notice"><InfoCircle />Niekompletne lub błędne wpisy ({incompleteCount}) nie są wliczane.</p>}
            <Button className="export-button" size="lg" iconLeading={Download01} onPress={exportSummary}>Pobierz podsumowanie</Button>
          </section>
          <div className="tip"><InfoCircle /><div><h3>Każda minuta się liczy</h3><p>Wpisz godzinę rozpoczęcia i zakończenia zajęć. Zsumujemy ich rzeczywisty czas i pokażemy wynik w godzinach i minutach.</p><span>Prosto i bez kalkulatora w głowie ✧</span></div></div>
          <div className="reset-area">{confirmReset ? <div className="reset-confirm"><p>Usunąć wszystkie wpisy? Ustawienia zostaną zachowane.</p><Button color="secondary" onPress={() => setConfirmReset(false)}>Anuluj</Button><Button color="primary-destructive" onPress={() => { setState(previous => ({ ...previous, days: initialState().days })); setConfirmReset(false) }}>Usuń wpisy</Button></div> : <Button color="link-gray" iconLeading={RefreshCcw01} onPress={() => setConfirmReset(true)}>Zacznij nowy tydzień</Button>}</div>
        </aside>
      </div>
      <footer className="footer"><span className="footer-brand">godzinka<span>.</span></span><span>Zrobione z myślą o Twoim czasie.</span><span>Policz. Zamknij. Odpocznij. <span className="footer-star">✧</span></span></footer>
    </main>
  </>
}
export default App
