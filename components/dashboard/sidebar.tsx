'use client'

import { useRouter } from 'next/navigation'
import { Video, Mic, User, Sparkles, Settings, LogOut, CreditCard, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks/use-user'
import { useSubscription } from '@/hooks/use-subscription'
import { useWorkflow } from '@/hooks/use-workflow'
import { TOOLS, TOOL_CONFIG, ToolType } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const toolIcons: Record<ToolType, React.ReactNode> = {
  lipsync: <Mic className="h-5 w-5" />,
  sora2: <Video className="h-5 w-5" />,
  veo3: <Sparkles className="h-5 w-5" />,
  avatar: <User className="h-5 w-5" />,
}

export function Sidebar() {
  const router = useRouter()
  const { user, profile, signOut } = useUser()
  const { credits, openPortal } = useSubscription()
  const { selectedTool, setSelectedTool, initializeWorkflowForTool } = useWorkflow()

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool)
    initializeWorkflowForTool(tool)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="w-64 h-screen bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">BlackTools</h1>
        <p className="text-xs text-muted-foreground">AI Video Generator</p>
      </div>

      {/* Tools */}
      <div className="flex-1 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          AI Tools
        </p>
        {Object.entries(TOOLS).map(([key, value]) => {
          const tool = value as ToolType
          const config = TOOL_CONFIG[tool]

          return (
            <Button
              key={key}
              variant={selectedTool === tool ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                selectedTool === tool && 'bg-secondary'
              )}
              onClick={() => handleToolSelect(tool)}
            >
              <span style={{ color: config.color }}>{toolIcons[tool]}</span>
              <span>{config.name}</span>
            </Button>
          )
        })}
      </div>

      {/* Credits */}
      <div className="p-4 border-t">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Credits</span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{credits.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">available</p>
        </div>
      </div>

      <Separator />

      {/* User */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {profile?.full_name || 'User'}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {profile?.subscription_plan || 'Free'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openPortal}>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
