import { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'
import { 
  X, Plus, Trash2, MessageSquare, Image, Square, List, GitBranch, 
  UserPlus, Bot, Clock, Webhook, Keyboard, MapPin, User, BarChart3, 
  FileText, AlertCircle, CheckCircle, Info, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ImprovedNodePropertiesPanelProps {
  node: Node
  onClose: () => void
  onUpdateNode: (nodeId: string, newData: any) => void
  onDeleteNode?: (nodeId: string) => void
}

const departmentOptions = [
  'Vendas',
  'Suporte Técnico', 
  'Financeiro',
  'Recursos Humanos',
  'Atendimento Geral'
]

export function ImprovedNodePropertiesPanel({ 
  node, 
  onClose, 
  onUpdateNode, 
  onDeleteNode 
}: ImprovedNodePropertiesPanelProps) {
  const [formData, setFormData] = useState(node.data)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setFormData(node.data)
    setHasUnsavedChanges(false)
  }, [node])

  const handleSave = () => {
    onUpdateNode(node.id, formData)
    setHasUnsavedChanges(false)
  }

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const getNodeInfo = () => {
    const nodeTypes = {
      start: {
        title: 'Nó de Início',
        description: 'Ponto de partida do fluxo de automação',
        icon: <div className="w-5 h-5 rounded-full bg-primary" />,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        category: 'Sistema'
      },
      textMessage: {
        title: 'Mensagem de Texto',
        description: 'Envie mensagens de texto personalizadas',
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        category: 'Mensagem'
      },
      mediaMessage: {
        title: 'Enviar Mídia',
        description: 'Compartilhe imagens, vídeos, documentos',
        icon: <Image className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        category: 'Mensagem'
      },
      buttonMessage: {
        title: 'Botões de Resposta',
        description: 'Ofereça até 3 opções clicáveis',
        icon: <Square className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        category: 'Interação'
      },
      listMessage: {
        title: 'Lista de Opções',
        description: 'Apresente uma lista organizada',
        icon: <List className="h-5 w-5" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        category: 'Interação'
      },
      conditional: {
        title: 'Condicional',
        description: 'Crie ramificações inteligentes',
        icon: <GitBranch className="h-5 w-5" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        category: 'Lógica'
      },
      transfer: {
        title: 'Transferir para Setor',
        description: 'Transfira para atendimento humano',
        icon: <UserPlus className="h-5 w-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        category: 'Integração'
      },
      aiAssistant: {
        title: 'IA Provisória',
        description: 'Assistente temporário',
        icon: <Bot className="h-5 w-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        category: 'Integração'
      },
      delay: {
        title: 'Aguardar',
        description: 'Adicione pausas estratégicas',
        icon: <Clock className="h-5 w-5" />,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        category: 'Lógica'
      },
      webhook: {
        title: 'Webhook',
        description: 'Integre com sistemas externos',
        icon: <Webhook className="h-5 w-5" />,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        category: 'Integração'
      },
      userInput: {
        title: 'Entrada do Usuário',
        description: 'Colete informações específicas',
        icon: <Keyboard className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        category: 'Interação'
      },
      location: {
        title: 'Solicitar Localização',
        description: 'Solicite localização do usuário',
        icon: <MapPin className="h-5 w-5" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        category: 'Interação'
      },
      contact: {
        title: 'Solicitar Contato',
        description: 'Peça compartilhamento de contato',
        icon: <User className="h-5 w-5" />,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50',
        category: 'Interação'
      },
      poll: {
        title: 'Enquete',
        description: 'Crie enquetes interativas',
        icon: <BarChart3 className="h-5 w-5" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        category: 'Interação'
      },
      template: {
        title: 'Template WhatsApp',
        description: 'Use templates pré-aprovados',
        icon: <FileText className="h-5 w-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        category: 'Mensagem'
      }
    }

    return nodeTypes[node.type as keyof typeof nodeTypes] || {
      title: 'Nó Personalizado',
      description: 'Configure as propriedades',
      icon: <div className="w-5 h-5 rounded bg-muted" />,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      category: 'Outros'
    }
  }

  const nodeInfo = getNodeInfo()

  const renderTextMessageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Mensagem de Texto
        </Label>
        <Textarea
          id="message"
          value={String(formData.message || '')}
          onChange={(e) => updateFormData('message', e.target.value)}
          placeholder="Digite a mensagem que será enviada ao cliente..."
          className="mt-2 min-h-24 resize-none"
          rows={4}
        />
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Dica:</strong> Use variáveis como {`{{nome_cliente}}`}, {`{{telefone}}`} para personalização
          </p>
        </div>
      </div>
    </div>
  )

  const renderButtonMessageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="message" className="text-sm font-medium">Mensagem Principal</Label>
        <Textarea
          id="message"
          value={String(formData.message || '')}
          onChange={(e) => updateFormData('message', e.target.value)}
          placeholder="Digite a mensagem com as opções..."
          className="mt-2 resize-none"
          rows={3}
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Botões de Ação</Label>
          <Badge variant="secondary" className="text-xs">Máximo 3 botões</Badge>
        </div>
        
        <div className="space-y-3">
          {(Array.isArray(formData.buttons) ? formData.buttons : []).map((button: any, index: number) => (
            <div key={index} className="flex gap-3 items-center p-3 border rounded-lg bg-muted/30">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                {index + 1}
              </div>
              <Input
                value={button.text || ''}
                onChange={(e) => {
                  const newButtons = [...(Array.isArray(formData.buttons) ? formData.buttons : [])]
                  newButtons[index] = { ...button, text: e.target.value }
                  updateFormData('buttons', newButtons)
                }}
                placeholder={`Texto do botão ${index + 1}`}
                className="flex-1"
              />
              {Array.isArray(formData.buttons) && formData.buttons.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newButtons = Array.isArray(formData.buttons) ? 
                      formData.buttons.filter((_: any, i: number) => i !== index) : []
                    updateFormData('buttons', newButtons)
                  }}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {(!Array.isArray(formData.buttons) || formData.buttons.length < 3) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newButtons = [...(Array.isArray(formData.buttons) ? formData.buttons : []), 
                  { id: Date.now().toString(), text: '' }]
                updateFormData('buttons', newButtons)
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Botão
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  const renderNodeSettings = () => {
    switch (node.type) {
      case 'start':
        return (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Este é o ponto de partida do seu fluxo. Todo cliente que iniciar uma conversa começará aqui. 
              Conecte este nó ao primeiro elemento da sua automação.
            </AlertDescription>
          </Alert>
        )

      case 'textMessage':
        return renderTextMessageSettings()

      case 'buttonMessage':
        return renderButtonMessageSettings()

      // Aqui você pode adicionar outros casos conforme necessário
      // Por brevidade, mantendo apenas alguns exemplos principais

      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              {nodeInfo.icon}
            </div>
            <p className="text-sm">
              Configurações específicas para este tipo de nó serão implementadas em breve.
            </p>
          </div>
        )
    }
  }

  const getValidationStatus = () => {
    // Validação básica - pode ser expandida conforme necessário
    switch (node.type) {
      case 'textMessage':
        return formData.message && String(formData.message).trim() ? 'valid' : 'invalid'
      case 'buttonMessage':
        return formData.message && Array.isArray(formData.buttons) && 
               formData.buttons.length > 0 && 
               formData.buttons.every((btn: any) => btn.text?.trim()) ? 'valid' : 'invalid'
      case 'start':
        return 'valid'
      default:
        return 'pending'
    }
  }

  const validationStatus = getValidationStatus()

  return (
    <div className="w-96 bg-background border-l shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn("p-2 rounded-lg", nodeInfo.bgColor)}>
              <div className={nodeInfo.color}>
                {nodeInfo.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{nodeInfo.title}</h3>
                {validationStatus === 'valid' && (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
                {validationStatus === 'invalid' && (
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{nodeInfo.description}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {nodeInfo.category}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderNodeSettings()}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t bg-muted/30">
        <div className="flex flex-col gap-3">
          {/* Save Button */}
          {node.type !== 'start' && (
            <Button 
              onClick={handleSave} 
              disabled={!hasUnsavedChanges}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {hasUnsavedChanges ? 'Salvar Alterações' : 'Salvo'}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            {onDeleteNode && node.id !== 'start' && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDeleteNode(node.id)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}