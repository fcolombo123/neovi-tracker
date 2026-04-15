import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import Header from './components/Header'
import Metrics from './components/Metrics'
import Tabs from './components/Tabs'
import ProjectList from './components/ProjectList'
import DetailPanel from './components/DetailPanel'
import AddProjectForm from './components/AddProjectForm'
import LoginPage from './components/LoginPage'
import OverdueView from './components/OverdueView'
import TeamView from './components/TeamView'
import ScheduleView from './components/ScheduleView'
import FactoryView from './components/FactoryView'
import NotificationsView from './components/NotificationsView'
import SettingsView from './components/SettingsView'
import StuckBanner from './components/StuckBanner'
import './App.css'

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { useSeedMode } = useData()
  const [activeTab, setActiveTab] = useState('projects')
  const [selectedId, setSelectedId] = useState(null)
  const [drilldownId, setDrilldownId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [currentRole, setCurrentRole] = useState('pm')

  const handleDarkMode = (on) => {
    setDarkMode(on)
    document.documentElement.setAttribute('data-theme', on ? 'dark' : '')
  }

  // When Supabase is configured, require login
  if (supabaseConfigured && !authLoading && !user) {
    return <LoginPage />
  }

  // Show loading while auth is resolving
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)' }}>
        <div style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const canEdit = currentRole === 'pm'

  return (
    <div className="app">
      <Header
        currentRole={currentRole}
        canEdit={canEdit}
        onNewProject={() => setShowAddForm(!showAddForm)}
        darkMode={darkMode}
        onToggleDarkMode={() => handleDarkMode(!darkMode)}
        user={user}
        onSignOut={signOut}
      />

      {showAddForm && canEdit && (
        <AddProjectForm onClose={() => setShowAddForm(false)} />
      )}

      <StuckBanner onSelectProject={(id) => { setActiveTab('projects'); setSelectedId(id); }} />

      <Metrics currentRole={currentRole} />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'projects' && (
        <div id="tab-projects">
          {drilldownId ? (
            <DetailPanel
              projectId={drilldownId}
              canEdit={canEdit}
              onBack={() => setDrilldownId(null)}
              isDrilldown={true}
              onProjectDeleted={() => { setDrilldownId(null); setSelectedId(null); }}
            />
          ) : selectedId ? (
            <div className="two-col">
              <ProjectList
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDeselect={() => setSelectedId(null)}
                onDrilldown={setDrilldownId}
                currentRole={currentRole}
                layout="list"
              />
              <DetailPanel
                projectId={selectedId}
                canEdit={canEdit}
                isDrilldown={false}
                onProjectDeleted={() => setSelectedId(null)}
              />
            </div>
          ) : (
            <ProjectList
              selectedId={null}
              onSelect={setSelectedId}
              onDrilldown={setDrilldownId}
              currentRole={currentRole}
              layout="grid"
            />
          )}
        </div>
      )}

      {activeTab === 'overdue' && <OverdueView />}
      {activeTab === 'team' && <TeamView />}
      {activeTab === 'schedule' && <ScheduleView />}
      {activeTab === 'factory' && <FactoryView />}
      {activeTab === 'notifications' && <NotificationsView />}
      {activeTab === 'settings' && (
        <SettingsView
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          darkMode={darkMode}
          onDarkModeChange={handleDarkMode}
        />
      )}
    </div>
  )
}

function AppShell() {
  const { user } = useAuth()
  return (
    <DataProvider user={user}>
      <AppContent />
    </DataProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
