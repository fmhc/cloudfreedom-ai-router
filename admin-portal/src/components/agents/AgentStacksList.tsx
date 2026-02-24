import { useState, useEffect } from 'react'
import { agentStacks, tenants, type AgentStack, type Tenant } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Plus, Trash2, RotateCw, FileText, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { DeployStackDialog } from './DeployStackDialog'
import { useToast } from '@/hooks/use-toast'

export function AgentStacksList() {
  const [stacksList, setStacksList] = useState<AgentStack[]>([])
  const [tenantsList, setTenantsList] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  const [deployDialogOpen, setDeployDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [stacksData, tenantsData] = await Promise.all([
        agentStacks.list(),
        tenants.list()
      ])
      setStacksList(stacksData)
      setTenantsList(tenantsData)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load agent stacks',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredStacks = stacksList.filter(stack => 
    selectedTenant === 'all' || stack.tenant_id === selectedTenant
  )

  const getTenantName = (tenantId: string) => {
    const tenant = tenantsList.find(t => t.id === tenantId)
    return tenant?.name || tenantId
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any, color?: string }> = {
      running: { variant: 'success' },
      stopped: { variant: 'secondary' },
      error: { variant: 'destructive' },
      deploying: { variant: 'default' },
      pending: { variant: 'outline' }
    }
    const config = variants[status] || { variant: 'default' }
    return <Badge variant={config.variant}>{status}</Badge>
  }

  const getTemplateBadge = (template: string) => {
    const variants: Record<string, any> = {
      'openclaw-agent': 'default',
      'telegram-bot': 'secondary',
      'base-llm': 'outline'
    }
    return <Badge variant={variants[template] || 'default'}>{template}</Badge>
  }

  const handleDelete = async (stack: AgentStack) => {
    if (!confirm(`Are you sure you want to delete stack ${stack.stack_name}?\n\nThis will permanently destroy the deployed application and cannot be undone.`)) {
      return
    }

    try {
      await agentStacks.delete(stack.id)
      toast({
        title: 'Success',
        description: 'Agent stack deleted successfully'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete agent stack',
        variant: 'destructive'
      })
    }
  }

  const handleStop = async (stack: AgentStack) => {
    if (!confirm(`Stop agent stack ${stack.stack_name}?`)) {
      return
    }

    try {
      await agentStacks.stop(stack.id)
      toast({
        title: 'Success',
        description: 'Agent stack stop initiated'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop agent stack',
        variant: 'destructive'
      })
    }
  }

  const handleRestart = async (stack: AgentStack) => {
    try {
      await agentStacks.restart(stack.id)
      toast({
        title: 'Success',
        description: 'Agent stack restart initiated'
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restart agent stack',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Loading agent stacks...</div>
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
              <CardTitle>Agent Stacks</CardTitle>
              <CardDescription>Manage deployed agent applications and containers</CardDescription>
            </div>
            <Button onClick={() => setDeployDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Deploy New Stack
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by Tenant:</span>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenantsList.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredStacks.length} stack{filteredStacks.length !== 1 ? 's' : ''} total
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stack Name</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {selectedTenant === 'all' 
                      ? "No agent stacks found. Deploy your first stack to get started."
                      : `No agent stacks found for the selected tenant.`
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredStacks.map((stack) => (
                  <TableRow key={stack.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs bg-muted px-2 py-1 rounded">{stack.stack_name}</code>
                      </div>
                    </TableCell>
                    <TableCell>{getTenantName(stack.tenant_id)}</TableCell>
                    <TableCell>{getTemplateBadge(stack.template)}</TableCell>
                    <TableCell>{getStatusBadge(stack.status)}</TableCell>
                    <TableCell>
                      {stack.domain ? (
                        <a 
                          href={`https://${stack.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {stack.domain}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(stack.created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Logs"
                          onClick={async () => {
                            try {
                              const result = await agentStacks.getLogs(stack.id)
                              // Show logs in a simple alert for now - TODO: proper modal
                              const logText = typeof result.logs === 'string' 
                                ? result.logs 
                                : JSON.stringify(result.logs, null, 2)
                              toast({ 
                                title: `Logs: ${stack.stack_name}`, 
                                description: logText.slice(0, 500) + (logText.length > 500 ? '...' : '')
                              })
                            } catch (error: any) {
                              toast({ 
                                title: 'Logs Error', 
                                description: error.message || 'Failed to fetch logs',
                                variant: 'destructive'
                              })
                            }
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {stack.status === 'running' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Restart"
                            onClick={() => handleRestart(stack)}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        )}
                        {(stack.status === 'running' || stack.status === 'deploying') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Stop"
                            onClick={() => handleStop(stack)}
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => handleDelete(stack)}
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

      <DeployStackDialog
        open={deployDialogOpen}
        onOpenChange={setDeployDialogOpen}
        onSuccess={loadData}
      />
    </>
  )
}