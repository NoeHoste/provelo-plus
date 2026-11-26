import { useState } from 'react'
import { BottomNav, type TabId } from './components/BottomNav'
import { Compare } from './pages/Compare'
import { Events } from './pages/Events'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { GoogleGate, MapScreen, hasKey } from './pages/MapPage'
import { ProfilePage } from './pages/Profile'
import { QrPass } from './pages/QrPass'
import { Rewards } from './pages/Rewards'
import { Signup, Welcome } from './pages/Signup'
import { Splash } from './pages/Splash'
import { useApp } from './store/AppContext'

type View = 'splash' | 'login' | 'signup' | 'welcome'

export default function App() {
  const { state } = useApp()
  const [view, setView] = useState<View>(state.account ? 'login' : 'splash')
  const [tab, setTab] = useState<TabId>('home')

  if (view === 'welcome') return <Welcome onDone={() => { setTab('home'); setView('login') }} />

  if (!state.loggedIn || !state.account || !state.profile) {
    if (view === 'signup') return <Signup onBack={() => setView('splash')} onLogin={() => setView('login')} onCreated={() => setView('welcome')} />
    if (view === 'login') return <Login onBack={() => setView('splash')} onSignup={() => setView('signup')} />
    return <Splash onSignup={() => setView('signup')} onLogin={() => setView('login')} />
  }

  const map = <MapScreen google={hasKey} onNav={setTab} />
  return (
    <div className="mx-auto min-h-full max-w-md">
      <main className="safe-top pb-24">
        {tab === 'home' && <Home onNav={setTab} />}
        {tab === 'map' && (hasKey ? <GoogleGate>{map}</GoogleGate> : map)}
        {tab === 'qr' && <QrPass onProfile={() => setTab('profile')} />}
        {tab === 'compare' && <Compare />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'events' && <Events />}
        {tab === 'profile' && <ProfilePage onBack={() => setTab('home')} onLogout={() => { setTab('home'); setView('login') }} />}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
