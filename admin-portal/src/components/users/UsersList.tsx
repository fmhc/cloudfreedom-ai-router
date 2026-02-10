import { useState, useEffect } from 'react'
import { users, tenants, products, type User, type Tenant, type Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { UserDialog } from './UserDialog'
import { useToast } from '@/hooks/use-toast'

export function UsersList() {
  const [usersList, setUsersList] = useState<User[]>([])
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, tenantsData, productsData] = await Promise.all([
        users.list(),
        tenants.list(),
        products.list()
      ])
      setUsersList(usersData.items || [])
      setTenantsList(tenantsData)
      setProductsList(productsData)
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
    setSelectedUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return
    }

    try {
      await users.delete(user.id)
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive'
      })
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active'
      await users.update(user.id, { status: newStatus })
      toast({
        title: 'Success',
        description: `User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      suspended: 'destructive',
      pending: 'warning'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getTenantName = (tenantId: string) => {
    const tenant = tenantsList.find(t => t.id === tenantId)
    return tenant?.name || 'Unknown'
  }

  const getProductName = (productId: string) => {
    const product = productsList.find(p => p.id === productId)
    return product?.name || 'No product'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
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
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and access</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No users found. Create your first user to get started.
                  </TableCell>
                </TableRow>
              ) : (
                usersList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getTenantName(user.tenant_id)}</TableCell>
                    <TableCell>{getProductName(user.product_id)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatCurrency((user.budget_limit || 0) - (user.budget_used || 0))} / {formatCurrency(user.budget_limit || 0)}</div>
                        <div className="text-muted-foreground text-xs">
                          Used: {formatCurrency(user.budget_used || 0)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(user.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        tenants={tenantsList}
        products={productsList}
        onSuccess={loadData}
      />
    </>
  )
}

