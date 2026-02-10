import { useState, useEffect } from 'react'
import { providerKeys, tenants, type TenantProviderKey, type Tenant } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Key, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ProviderKeyDialog } from './ProviderKeyDialog'
import { useToast } from '@/hooks/use-toast'

export function ProviderKeysList() {
  const [keysList, setKeysList] = useState<TenantProviderKey[]>([])
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<TenantProviderKey | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      // Provider keys collection doesn't exist yet - skip loading
      const tenantsData = await tenants.list()
      setKeysList([])
      setTenantsList(tenantsData)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = () => {
    setSelectedKey(null)
    setDialogOpen(true)
  }

  const handleEdit = (key: TenantProviderKey) => {
    setSelectedKey(key)
    setDialogOpen(true)
  }

  const handleDelete = async (key: TenantProviderKey) => {
    if (!confirm(`Are you sure you want to delete this ${key.provider} provider key?`)) {
      return
    }

    try {
      await providerKeys.delete(key.id)
      toast({
        title: 'Success',
        description: 'Provider key deleted successfully'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete provider key',
        variant: 'destructive'
      })
    }
  }

  const handleTestConnection = async (key: TenantProviderKey) => {
    try {
      const result = await providerKeys.testConnection(key.id)
      toast({
        title: result.success ? 'Success' : 'Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to test connection',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      inactive: 'secondary',
      error: 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      google: 'bg-blue-100 text-blue-800',
      azure: 'bg-cyan-100 text-cyan-800',
      aws: 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={colors[provider] || ''}>
        {provider.toUpperCase()}
      </Badge>
    )
  }

  const getTenantName = (tenantId: string) => {
    const tenant = tenantsList.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Loading provider keys...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Provider Keys</CardTitle>
              <CardDescription>Manage API keys for AI providers (Google, Azure, AWS)</CardDescription>
            </div>
            <Button onClick={handleCreate} disabled>
              <Key className="mr-2 h-4 w-4" />
              Add Provider Key (Coming Soon)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage (Today)</TableHead>
                <TableHead>Budget (Month)</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keysList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">Provider Keys - Coming Soon</div>
                      <div>This feature is currently under development.</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                keysList.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{getTenantName(key.tenant_id)}</TableCell>
                    <TableCell>{getProviderBadge(key.provider)}</TableCell>
                    <TableCell>{key.provider_name}</TableCell>
                    <TableCell>{getStatusBadge(key.status)}</TableCell>
                    <TableCell>
                      {key.usage_today ? (
                        <div className="text-sm">
                          {formatCurrency(key.usage_today)}
                          {key.daily_limit && (
                            <div className="text-xs text-muted-foreground">
                              / {formatCurrency(key.daily_limit)}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {key.monthly_budget ? (
                        <div className="text-sm">
                          {formatCurrency(key.usage_month || 0)} / {formatCurrency(key.monthly_budget)}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {key.last_used ? formatDateTime(key.last_used) : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTestConnection(key)}
                          title="Test connection"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(key)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProviderKeyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        providerKey={selectedKey}
        tenants={tenantsList}
        onSuccess={loadData}
      />
    </>
  )
}

