import { useState, useCallback, useRef, DragEvent, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

// Custom Nodes
import { StartNode } from '@/components/automation/nodes/StartNode'
import { MessageNode } from '@/components/automation/nodes/MessageNode'
import { QuestionNode } from '@/components/automation/nodes/QuestionNode'
import { ConditionNode } from '@/components/automation/nodes/ConditionNode'
import { NodeSidebar } from '@/components/automation/NodeSidebar'
import { SettingsPanel } from '@/components/automation/SettingsPanel'

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  question: QuestionNode,
  condition: ConditionNode,
}

let id = 0
const getId = () => `dndnode_${id++}`

function FlowBuilder() {
  const { id: automationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { screenToFlowPosition } = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [automationName, setAutomationName] = useState('')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Fetch automation data
  const { data: automation, isLoading } = useQuery({
    queryKey: ['automation', automationId],
    queryFn: async () => {
      if (automationId === 'new') return null
      
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', automationId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!automationId,
  })

  // Initialize flow when automation is loaded
  useEffect(() => {
    if (automation) {
      setAutomationName(automation.name)
      const flowData = automation.flow_data as { nodes?: Node[], edges?: Edge[] }
      if (flowData?.nodes) {
        setNodes(flowData.nodes)
      }
      if (flowData?.edges) {
        setEdges(flowData.edges)
      }
    }
  }, [automation, setNodes, setEdges])

  // Save automation mutation
  const saveAutomationMutation = useMutation({
    mutationFn: async () => {
      const flowData = { nodes, edges }
      
      const { data, error } = await supabase.functions.invoke('save-automation-flow', {
        body: {
          id: automationId === 'new' ? undefined : automationId,
          name: automationName,
          flow_data: flowData
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Sucesso',
        description: 'Automação salva com sucesso!'
      })
      
      // If it was a new automation, navigate to the edit page
      if (automationId === 'new' && data.data) {
        navigate(`/automations/builder/${data.data.id}`, { replace: true })
      }
      
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao salvar automação: ${error.message}`,
        variant: 'destructive'
      })
    }
  })

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      
      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { 
          label: `${type} node`,
          message: type === 'message' ? 'Digite sua mensagem aqui' : '',
          question: type === 'question' ? 'Digite sua pergunta aqui' : '',
          condition: type === 'condition' ? 'response contains' : '',
          value: type === 'condition' ? 'sim' : ''
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    )
  }, [setNodes])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando automação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/automations')}>
              ← Voltar
            </Button>
            <Input
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              placeholder="Nome da automação"
              className="w-64"
            />
          </div>
          <Button 
            onClick={() => saveAutomationMutation.mutate()}
            disabled={!automationName.trim() || saveAutomationMutation.isPending}
          >
            {saveAutomationMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Node Sidebar */}
        <NodeSidebar />

        {/* Flow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Settings Panel */}
        {selectedNode && (
          <SettingsPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={updateNodeData}
          />
        )}
      </div>
    </div>
  )
}

export default function AutomationBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  )
}