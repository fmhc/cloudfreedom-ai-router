import { useState, useEffect } from 'react'
import { providerKeys, type TenantProviderKey, type Tenant } from '@/lib/api'
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

interface ProviderKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerKey: TenantProviderKey | null
  tenants: Tenant[]
  onSuccess: () => void
}

export function ProviderKeyDialog({ open, onOpenChange, providerKey, tenants, onSuccess }: ProviderKeyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tenant_id: '',
    provider: 'google' as 'google' | 'azure' | 'aws',
    provider_name: '',
    api_key: '',
    api_key_secondary: '',
    endpoint: '',
    region: '',
    project_id: '',
    status: 'active' as 'active' | 'inactive' | 'error',
    daily_limit: 0,
    monthly_budget: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    if (providerKey) {
      setFormData({
        tenant_id: providerKey.tenant_id,
        provider: providerKey.provider,
        provider_name: providerKey.provider_name,
        api_key: '', // Don't show existing key
        api_key_secondary: '',
        endpoint: providerKey.endpoint || '',
        region: providerKey.region || '',
        project_id: providerKey.project_id || '',
        status: providerKey.status,
        daily_limit: providerKey.daily_limit || 0,
        monthly_budget: providerKey.monthly_budget || 0
      })
    } else {
      setFormData({
        tenant_id: tenants[0]?.id || '',
        provider: 'google',
        provider_name: '',
        api_key: '',
        api_key_secondary: '',
        endpoint: '',
        region: '',
        project_id: '',
        status: 'active',
        daily_limit: 0,
        monthly_budget: 0
      })
    }
  }, [providerKey, open, tenants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit: any = { ...formData }
      
      // Remove empty optional fields
      if (!dataToSubmit.api_key_secondary) delete dataToSubmit.api_key_secondary
      if (!dataToSubmit.endpoint) delete dataToSubmit.endpoint
      if (!dataToSubmit.region) delete dataToSubmit.region
      if (!dataToSubmit.project_id) delete dataToSubmit.project_id
      
      // Don't update API key if empty (for edits)
      if (providerKey && !dataToSubmit.api_key) {
        delete dataToSubmit.api_key
      }

      if (providerKey) {
        await providerKeys.update(providerKey.id, dataToSubmit)
        toast({
          title: 'Success',
          description: 'Provider key updated successfully'
        })
      } else {
        await providerKeys.create(dataToSubmit)
        toast({
          title: 'Success',
          description: 'Provider key created successfully'
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save provider key',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{providerKey ? 'Edit Provider Key' : 'Add New Provider Key'}</DialogTitle>
          <DialogDescription>
            {providerKey ? 'Update provider configuration' : 'Add a new AI provider API key'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="provider">Provider</Label>
              <Select value={formData.provider} onValueChange={(value: any) => setFormData({ ...formData, provider: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google (Vertex AI)</SelectItem>
                  <SelectItem value="azure">Azure (OpenAI)</SelectItem>
                  <SelectItem value="aws">AWS (Bedrock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                required
                placeholder="e.g., Production Google AI"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                required={!providerKey}
                placeholder={providerKey ? 'Leave empty to keep existing' : 'Enter API key'}
              />
            </div>

            {formData.provider === 'azure' && (
              <div className="space-y-2">
                <Label htmlFor="api_key_secondary">Secondary API Key</Label>
                <Input
                  id="api_key_secondary"
                  type="password"
                  value={formData.api_key_secondary}
                  onChange={(e) => setFormData({ ...formData, api_key_secondary: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g., us-central1, eastus"
              />
            </div>

            {formData.provider === 'google' && (
              <div className="space-y-2">
                <Label htmlFor="project_id">Project ID</Label>
                <Input
                  id="project_id"
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  placeholder="your-project-id"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_limit">Daily Limit (€)</Label>
              <Input
                id="daily_limit"
                type="number"
                step="0.01"
                value={formData.daily_limit}
                onChange={(e) => setFormData({ ...formData, daily_limit: parseFloat(e.target.value) })}
                placeholder="0 = no limit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_budget">Monthly Budget (€)</Label>
              <Input
                id="monthly_budget"
                type="number"
                step="0.01"
                value={formData.monthly_budget}
                onChange={(e) => setFormData({ ...formData, monthly_budget: parseFloat(e.target.value) })}
                placeholder="0 = no limit"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (providerKey ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

