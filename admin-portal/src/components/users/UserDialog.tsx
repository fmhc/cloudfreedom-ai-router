import { useState, useEffect } from 'react'
import { users, type User, type Tenant, type Product } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { generateApiKey } from '@/lib/utils'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  tenants: Tenant[]
  products: Product[]
  onSuccess: () => void
}

export function UserDialog({ open, onOpenChange, user, tenants, products, onSuccess }: UserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user' as 'user' | 'tenant_admin' | 'super_admin',
    status: 'active' as 'pending' | 'active' | 'suspended',
    tenant_id: '',
    product_id: '',
    budget_limit: 0,
    budget_used: 0,
    api_key: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name,
        password: '',
        role: user.role,
        status: user.status,
        tenant_id: user.tenant_id,
        product_id: user.product_id,
        budget_limit: user.budget_limit || 0,
        budget_used: user.budget_used || 0,
        api_key: user.api_key || ''
      })
    } else {
      // Generate API key for new users
      setFormData({
        email: '',
        name: '',
        password: crypto.randomUUID().substring(0, 16),
        role: 'user',
        status: 'active',
        tenant_id: tenants[0]?.id || '',
        product_id: products[0]?.id || '',
        budget_limit: products[0]?.budget_included || 0,
        budget_used: 0,
        api_key: `sk-${generateApiKey()}`
      })
    }
  }, [user, open, tenants, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedProduct = products.find(p => p.id === formData.product_id)
      const dataToSubmit: any = {
        email: formData.email,
        name: formData.name,
        tenant_id: formData.tenant_id,
        product_id: formData.product_id,
        role: formData.role,
        status: formData.status,
        budget_limit: formData.budget_limit || selectedProduct?.budget_included || 0,
        budget_used: formData.budget_used || 0,
        api_key: formData.api_key
      }

      if (user) {
        await users.update(user.id, dataToSubmit)
        toast({
          title: 'Success',
          description: 'User updated successfully'
        })
      } else {
        await users.create(dataToSubmit)
        toast({
          title: 'Success',
          description: `User created successfully`
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setFormData(prev => ({
      ...prev,
      product_id: productId,
      budget_limit: product?.budget_included || 0
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user information and settings' : 'Create a new user account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!user}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant</Label>
              <Select value={formData.tenant_id} onValueChange={(value) => setFormData({ ...formData, tenant_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={formData.product_id} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (€{product.budget_included}/mo)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_limit">Budget Limit (€)</Label>
              <Input
                id="budget_limit"
                type="number"
                step="0.01"
                value={formData.budget_limit}
                onChange={(e) => setFormData({ ...formData, budget_limit: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_used">Budget Used (€)</Label>
              <Input
                id="budget_used"
                type="number"
                step="0.01"
                value={formData.budget_used}
                onChange={(e) => setFormData({ ...formData, budget_used: parseFloat(e.target.value) })}
                disabled
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="api_key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api_key"
                  type="text"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  required
                  placeholder="sk-..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, api_key: 'sk-' + generateApiKey() })}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">This key is used for LiteLLM proxy authentication</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

