import { useState } from 'react'
import { BottomNav, type TabId } from './components/BottomNav'
import { ProVeloLogo } from './components/ProVeloLogo'
import { Dashboard } from './pages/Dashboard'
import { Events } from './pages/Events'
import { MapPage } from './pages/MapPage'
import { Onboarding } from './pages/Onboarding'
import { ProfilePage } from './pages/Profile'
import { QrPass } from './pages/QrPass'
import { Rewards } from './pages/Rewards'
import { useApp } from './store/AppContext'

export default function App() {
  const { state, markIntroSeen } = useApp()
  const [tab, setTab] = useState<TabId>('home')

  if (!state.introSeen) {
    return (
      <Onboarding
        onSignup={() => { markIntroSeen(); setTab('profile') }}
        onSkip={markIntroSeen}
      />
    )
  }

  return (
    <div className="mx-auto min-h-full max-w-md bg-slate-50">
      <div className="safe-top flex items-center justify-between bg-navy-900 px-4 py-2">
        <ProVeloLogo light size={28} />
      </div>
      <main className="pb-24">
        {tab === 'home' && <Dashboard onNav={setTab} />}
        {tab === 'rewards' && <Rewards />}
        {tab === 'map' && <MapPage />}
        {tab === 'qr' && <QrPass onProfile={() => setTab('profile')} />}
        {tab === 'events' && <Events />}
        {tab === 'profile' && <ProfilePage />}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
