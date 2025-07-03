import { DragEvent } from 'react'
import { Play, MessageSquare, HelpCircle, GitBranch } from 'lucide-react'

const nodeTypes = [
  {
    type: 'start',
    label: 'Início',
    icon: Play,
    description: 'Ponto de partida do fluxo',
    color: 'text-primary'
  },
  {
    type: 'message',
    label: 'Enviar Mensagem',
    icon: MessageSquare,
    description: 'Envia uma mensagem de texto',
    color: 'text-blue-600'
  },
  {
    type: 'question',
    label: 'Fazer Pergunta',
    icon: HelpCircle,
    description: 'Faz uma pergunta e aguarda resposta',
    color: 'text-orange-600'
  },
  {
    type: 'condition',
    label: 'Condição',
    icon: GitBranch,
    description: 'Ramifica o fluxo baseado em condições',
    color: 'text-purple-600'
  }
]

export function NodeSidebar() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-64 bg-background border-r p-4">
      <h3 className="font-semibold text-sm mb-4">Elementos do Fluxo</h3>
      
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            className="p-3 border border-border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
            draggable
            onDragStart={(event) => onDragStart(event, nodeType.type)}
          >
            <div className="flex items-center gap-2 mb-1">
              <nodeType.icon className={`h-4 w-4 ${nodeType.color}`} />
              <span className="font-medium text-sm">{nodeType.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {nodeType.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Arraste os elementos para o canvas para construir seu fluxo de automação.
        </p>
      </div>
    </div>
  )
}