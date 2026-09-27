"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@aqua-calendar/ui/components/dropdown-menu"
import { Button } from "@aqua-calendar/ui/components/button"
import { Check, ChevronDown, Plus, Settings, UserPlus } from "lucide-react"
import { useState } from "react"

interface Workspace {
  id: string
  name: string
  avatar?: string
  plan?: string
  memberCount?: number
}

export function WorkspaceSwitcher() {
  const workspaces: Workspace[] = [
    {
      id: "1",
      name: "Quý Nguyễn's Notion",
      plan: "Business Plan",
      memberCount: 1,
    },
    {
      id: "2",
      name: "Quý Nguyễn's Space",
    },
  ]

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(
    workspaces[0]!
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-1.5 hover:bg-accent"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded text-xs font-semibold">
            {currentWorkspace.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-xs font-medium">
              {currentWorkspace.name}
            </div>
          </div>
          <ChevronDown className="size-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        {/* Current Workspace Info */}
        <div className="px-2 py-2">
          <div className="flex items-start gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded text-sm font-semibold">
              {currentWorkspace.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {currentWorkspace.name}
              </div>
              {currentWorkspace.plan && currentWorkspace.memberCount && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {currentWorkspace.plan} · {currentWorkspace.memberCount}{" "}
                  member
                  {currentWorkspace.memberCount > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <Button variant="outline" size="sm" className="h-7 flex-1 text-xs">
              <Settings className="size-3" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="h-7 flex-1 text-xs">
              <UserPlus className="size-3" />
              Invite
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Workspace List */}
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            className="flex cursor-pointer items-center gap-2 px-2 py-1.5"
            onClick={() => setCurrentWorkspace(workspace)}
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded text-xs font-semibold">
              {workspace.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">
                {workspace.name}
              </div>
            </div>
            {currentWorkspace.id === workspace.id && (
              <Check className="size-3 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}

        {/* New Workspace */}
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-2 py-1.5">
          <Plus className="mr-2 size-4" />
          <span className="text-sm font-medium">Add workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
