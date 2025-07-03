import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { List } from 'lucide-react'

export const ListMessageNode = memo(({ data, selected }: { data: any; selected?: boolean }) => {
  const items = (data.sections && data.sections[0]?.items) || [
    { id: '1', title: 'Item 1' }, 
    { id: '2', title: 'Item 2' }, 
    { id: '3', title: 'Item 3' }
  ];
  
  return (
    <div className={`bg-white border-2 ${selected ? 'border-primary' : 'border-teal-300'} rounded-lg p-3 min-w-[220px] shadow-lg`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-teal-500 rounded-full p-1">
          <List className="h-3 w-3 text-white" />
        </div>
        <div className="font-semibold text-teal-800 text-sm">Lista de Opções</div>
      </div>
      
      <div className="text-sm text-gray-700 mb-2 max-w-[200px] break-words">
        {data.message || 'Clique para editar mensagem...'}
      </div>
      
      <div className="text-xs text-gray-500 mb-3 px-2 py-1 bg-teal-50 rounded border">
        📋 {data.buttonText || 'Ver opções'}
      </div>
      
      {/* Items com handles na lateral direita */}
      <div className="space-y-2">
        {items.slice(0, 5).map((item: any, index: number) => (
          <div key={index} className="relative flex items-center">
            <div className="flex-1 text-xs bg-teal-50 border border-teal-200 rounded px-3 py-2 pr-8">
              <div className="font-medium">{item.title || `Item ${index + 1}`}</div>
              {item.description && (
                <div className="text-gray-500 text-xs mt-1 truncate">
                  {item.description}
                </div>
              )}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={`item-${index}`}
              className="w-2 h-2 bg-teal-500 border border-white !relative !transform-none !right-0 !top-0 ml-1"
            />
          </div>
        ))}
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-teal-500 border-2 border-white"
      />
    </div>
  )
})