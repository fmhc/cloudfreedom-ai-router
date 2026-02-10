import { useState } from 'react'
import { pb } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Users, Building2, Package, Activity, Key, Lock } from 'lucide-react'
import { UsageAnalytics } from '@/components/analytics/UsageAnalytics'
import { UsersList } from '@/components/users/UsersList'
import { TenantsList } from '@/components/tenants/TenantsList'
import { ProductsList } from '@/components/products/ProductsList'
import { ProviderKeysList } from '@/components/tenants/ProviderKeysList'
import { PasswordChangeDialog } from '@/components/users/PasswordChangeDialog'

type TabType = 'overview' | 'users' | 'tenants' | 'products' | 'providers'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const user = pb.authStore.model

  const handleLogout = async () => {
    pb.authStore.clear()
    window.location.reload()
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'tenants' as TabType, label: 'Tenants', icon: Building2 },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'providers' as TabType, label: 'Provider Keys', icon: Key },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CloudFreedom Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Monitor your CloudFreedom AI Router platform</p>
              </div>
              <UsageAnalytics />
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Start</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Create Tenants</h4>
                      <p className="text-sm text-gray-600">Set up tenant organizations for your customers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Configure Products</h4>
                      <p className="text-sm text-gray-600">Define pricing tiers and budget allocations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Add Provider Keys</h4>
                      <p className="text-sm text-gray-600">Configure AI provider API keys (Google, Azure, AWS)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Create Users</h4>
                      <p className="text-sm text-gray-600">Add users and assign them to tenants and products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UsersList />}
          {activeTab === 'tenants' && <TenantsList />}
          {activeTab === 'products' && <ProductsList />}
          {activeTab === 'providers' && <ProviderKeysList />}
        </div>
      </main>

      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  )
}
