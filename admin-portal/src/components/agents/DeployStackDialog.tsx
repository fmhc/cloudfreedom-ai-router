import { useState, useEffect } from 'react'
import { agentStacks, tenants, type Tenant } from '@/lib/api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Bot, Rocket } from 'lucide-react'

interface DeployStackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const TEMPLATES = [
  {
    id: 'openclaw-agent',
    name: 'OpenClaw Agent',
    description: 'Full-featured AI agent with OpenClaw framework',
    envVars: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'TELEGRAM_BOT_TOKEN']
  },
  {
    id: 'telegram-bot',
    name: 'Telegram Bot',
    description: 'Lightweight Telegram bot template',
    envVars: ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY']
  },
  {
    id: 'base-llm',
    name: 'Base LLM Gateway',
    description: 'Basic LLM API gateway without UI',
    envVars: ['API_KEY', 'MODEL_PROVIDER']
  }
]

export function DeployStackDialog({ open, onOpenChange, onSuccess }: DeployStackDialogProps) {
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tenant_id: '',
    template: '',
    stack_name: '',
    domain: '',
    env_vars: {} as Record<string, string>
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadTenants()
    }
  }, [open])

  const loadTenants = async () => {
    try {
      const data = await tenants.list()
      setTenantsList(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tenants',
        variant: 'destructive'
      })
    }
  }

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.template)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tenant_id || !formData.template || !formData.stack_name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    // Validate stack name format (Docker-safe)
    if (!/^[a-z0-9-]+$/.test(formData.stack_name)) {
      toast({
        title: 'Validation Error',
        description: 'Stack name must contain only lowercase letters, numbers, and hyphens',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      await agentStacks.deploy({
        tenant_id: formData.tenant_id,
        template: formData.template as any,
        stack_name: formData.stack_name,
        domain: formData.domain || undefined,
        env_vars: formData.env_vars
      })
      
      toast({
        title: 'Success',
        description: 'Agent stack deployment initiated. Check status in the list.'
      })
      
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: 'Deployment Error',
        description: error.message || 'Failed to deploy agent stack',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      template: '',
      stack_name: '',
      domain: '',
      env_vars: {}
    })
  }

  const handleEnvVarChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      env_vars: { ...prev.env_vars, [key]: value }
    }))
  }

  const generateStackName = () => {
    if (formData.tenant_id && formData.template) {
      const tenant = tenantsList.find(t => t.id === formData.tenant_id)
      const tenantSlug = tenant?.slug || 'tenant'
      const template = formData.template.replace('-', '')
      const timestamp = Date.now().toString().slice(-4)
      setFormData(prev => ({
        ...prev,
        stack_name: `cf-${template}-${tenantSlug}-${timestamp}`
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deploy New Agent Stack
          </DialogTitle>
          <DialogDescription>
            Deploy a new agent application stack for a tenant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant">Tenant *</Label>
              <Select 
                value={formData.tenant_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tenant_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenantsList.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template *</Label>
              <Select 
                value={formData.template} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTemplate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{selectedTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="stack_name">Stack Name *</Label>
            <div className="flex gap-2">
              <Input
                id="stack_name"
                value={formData.stack_name}
                onChange={(e) => setFormData(prev => ({ ...prev, stack_name: e.target.value }))}
                placeholder="cf-agent-example-2026"
                className="font-mono text-sm"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={generateStackName}
                disabled={!formData.tenant_id || !formData.template}
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and hyphens. Will be used for Coolify service name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain (optional)</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="example.cloudfreedom.de"
            />
            <p className="text-xs text-muted-foreground">
              If provided, SSL certificate will be automatically configured
            </p>
          </div>

          {selectedTemplate && selectedTemplate.envVars.length > 0 && (
            <div className="space-y-3">
              <Label>Environment Variables</Label>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {selectedTemplate.envVars.map((envVar) => (
                      <div key={envVar} className="space-y-1">
                        <Label htmlFor={envVar} className="text-sm font-mono">
                          {envVar}
                        </Label>
                        <Input
                          id={envVar}
                          value={formData.env_vars[envVar] || ''}
                          onChange={(e) => handleEnvVarChange(envVar, e.target.value)}
                          placeholder={envVar.includes('TOKEN') ? 'bot123456:ABC-DEF1234...' : 'sk-...'}
                          type={envVar.toLowerCase().includes('key') || envVar.toLowerCase().includes('token') ? 'password' : 'text'}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Deploying...' : 'Deploy Stack'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}