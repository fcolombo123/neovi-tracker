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
import './App.css'

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { useSeedMode } = useData()
  const [activeTab, setActiveTab] = useState('projects')
  const [selectedId, setSelectedId] = useState(1)
  const [drilldownId, setDrilldownId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [currentRole, setCurrentRole] = useState('pm')

  const handleDarkMode = (on) => {
    setDarkMode(on)
    document.documentElement.setAttribute('data-theme', on ? 'dark' : '')
  }

  // Show login page if Supabase is configured and user is not authenticated
  if (!useSeedMode && !authLoading && !user) {
    return <LoginPage />
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
            />
          ) : (
            <div className="two-col">
              <ProjectList
                selectedId={selectedId}
                onSelect={setSelectedId}
                onDrilldown={setDrilldownId}
                currentRole={currentRole}
              />
              <DetailPanel
                projectId={selectedId}
                canEdit={canEdit}
                isDrilldown={false}
              />
            </div>
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

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
