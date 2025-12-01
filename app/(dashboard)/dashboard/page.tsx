'use client'

import { WorkflowCanvas } from '@/components/dashboard/workflow-canvas'
import { ResultsPanel } from '@/components/dashboard/results-panel'

export default function DashboardPage() {
  return (
    <div className="flex h-full">
      <WorkflowCanvas />
      <ResultsPanel />
    </div>
  )
}
