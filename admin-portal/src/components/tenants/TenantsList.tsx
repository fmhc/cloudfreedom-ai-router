import { useState, useEffect } from 'react'
import { tenants, type Tenant } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Building2, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { TenantDialog } from './TenantDialog'
import { useToast } from '@/hooks/use-toast'

export function TenantsList() {
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await tenants.list()
      setTenantsList(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tenants',
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
    setSelectedTenant(null)
    setDialogOpen(true)
  }

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDialogOpen(true)
  }

  const handleDelete = async (tenant: Tenant) => {
    if (!confirm(`Are you sure you want to delete tenant ${tenant.name}?`)) {
      return
    }

    try {
      await tenants.delete(tenant.id)
      toast({
        title: 'Success',
        description: 'Tenant deleted successfully'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tenant',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      internal: 'default',
      demo: 'secondary',
      dev: 'outline',
      enterprise: 'success'
    }
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Loading tenants...</div>
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
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Manage tenant organizations and configurations</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Building2 className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No tenants found. Create your first tenant to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tenantsList.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{tenant.slug}</code>
                    </TableCell>
                    <TableCell>{tenant.domain || '-'}</TableCell>
                    <TableCell>{getTypeBadge(tenant.type)}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{formatDateTime(tenant.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tenant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tenant)}
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

      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        onSuccess={loadData}
      />
    </>
  )
}

