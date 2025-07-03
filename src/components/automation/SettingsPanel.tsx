import { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SettingsPanelProps {
  node: Node
  onClose: () => void
  onUpdateNode: (nodeId: string, newData: any) => void
}

export function SettingsPanel({ node, onClose, onUpdateNode }: SettingsPanelProps) {
  const [formData, setFormData] = useState(node.data)

  useEffect(() => {
    setFormData(node.data)
  }, [node])

  const handleSave = () => {
    onUpdateNode(node.id, formData)
    onClose()
  }

  const renderNodeSettings = () => {
    switch (node.type) {
      case 'start':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O nó de início é o ponto de partida do seu fluxo. Não é necessária configuração adicional.
            </p>
          </div>
        )

      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={(formData.message as string) || ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Digite a mensagem que será enviada..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        )

      case 'question':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Pergunta</Label>
              <Textarea
                id="question"
                value={(formData.question as string) || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Digite a pergunta que será feita..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Tipo de Condição</Label>
              <Select
                value={(formData.condition as string) || 'contains'}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Resposta contém</SelectItem>
                  <SelectItem value="equals">Resposta é igual a</SelectItem>
                  <SelectItem value="starts_with">Resposta começa com</SelectItem>
                  <SelectItem value="ends_with">Resposta termina com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Valor de Comparação</Label>
              <Input
                id="value"
                value={(formData.value as string) || ''}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Digite o valor para comparação..."
                className="mt-1"
              />
            </div>
          </div>
        )

      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este tipo de nó.</p>
    }
  }

  const getNodeTitle = () => {
    switch (node.type) {
      case 'start': return 'Configurar Início'
      case 'message': return 'Configurar Mensagem'
      case 'question': return 'Configurar Pergunta'
      case 'condition': return 'Configurar Condição'
      default: return 'Configurações'
    }
  }

  return (
    <div className="w-80 bg-background border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">{getNodeTitle()}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {renderNodeSettings()}

      {node.type !== 'start' && (
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            Salvar
          </Button>
        </div>
      )}
    </div>
  )
}