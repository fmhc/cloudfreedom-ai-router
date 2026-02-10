import { useState, useEffect } from 'react'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { pb } from './lib/api'
import { Toaster } from './components/ui/toaster'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(pb.authStore.isValid)
    setLoading(false)

    // Subscribe to auth state changes
    pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <Login />}
      <Toaster />
    </>
  )
}
