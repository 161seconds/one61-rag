import { Button } from "@aqua-calendar/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqua-calendar/ui/components/card"
import { Separator } from "@aqua-calendar/ui/components/separator"
import {
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  Goal,
  Link2,
  ListTodo,
  Plus,
  ShieldAlert,
  Sparkles,
  Target,
  TimerReset,
  TriangleAlert,
  Zap,
} from "lucide-react"

/* ─────────────────────────── Types ─────────────────────────── */

type PersonalMetric = {
  label: string
  value: string
  hint: string
  tone: "good" | "warn" | "neutral"
}

type TimelineItem = {
  time: string
  title: string
  context: string
  tag: "focus" | "meeting" | "task"
}

type TaskItem = {
  title: string
  due: string
  effort: string
}

type TimeBucket = {
  title: "Now" | "Next" | "Later"
  subtitle: string
  tasks: TaskItem[]
}

type RiskItem = {
  title: string
  due: string
  reason: string
  risk: number
}

type CoachAction = {
  title: string
  reason: string
  impact: string
}

type GoalProgress = {
  name: string
  current: number
  target: number
}

type HeatmapRow = {
  label: string
  values: number[]
}

type RecentItem = {
  id: string
  icon: string
  label: string
  sub: string
  time: string
}

/* ─────────────────────────── Helpers ─────────────────────────── */


/* ─────────────────────────── Static data ─────────────────────── */

const RECENT_ITEMS: RecentItem[] = [
  { id: "1", icon: "📅", label: "Design review: task detail panel", sub: "Calendar event", time: "2 hours ago" },
  { id: "2", icon: "✅", label: "Finalize retry strategy doc", sub: "Task · Due today", time: "3 hours ago" },
  { id: "3", icon: "💬", label: "AI Assistant chat session", sub: "AI Coach", time: "Yesterday" },
  { id: "4", icon: "⚙️", label: "Notification preferences", sub: "Settings", time: "2 days ago" },
]

const PERSONAL_METRICS: PersonalMetric[] = [
  { label: "Focus score", value: "82/100", hint: "2 protected deep-work blocks", tone: "good" },
  { label: "Deadline pressure", value: "Medium", hint: "2 tasks need attention in 48h", tone: "warn" },
  { label: "Energy alignment", value: "Strong", hint: "Heavy tasks in peak hours", tone: "good" },
  { label: "Context switches", value: "7 today", hint: "Down 4 from yesterday", tone: "neutral" },
]

const TODAY_TIMELINE: TimelineItem[] = [
  { time: "08:30 – 10:00", title: "Deep work: recurring event conflicts", context: "Best focus window by your historical productivity", tag: "focus" },
  { time: "10:15 – 11:00", title: "Design review: task detail panel", context: "Meeting cluster kept short to preserve momentum", tag: "meeting" },
  { time: "11:15 – 12:00", title: "Triage overdue tasks", context: "AI prioritized high-impact items first", tag: "task" },
  { time: "14:00 – 15:30", title: "Build reminder retry fallback", context: "Scheduled before cognitive dip window", tag: "focus" },
]

const TIME_BUCKETS: TimeBucket[] = [
  {
    title: "Now",
    subtitle: "Highest impact in the next 2 hours",
    tasks: [
      { title: "Finalize retry strategy doc", due: "Today 10:00", effort: "45m" },
      { title: "Reply PM blockers thread", due: "Today 10:30", effort: "20m" },
    ],
  },
  {
    title: "Next",
    subtitle: "Keep the day on-track",
    tasks: [
      { title: "Review QA bugs for calendar drag", due: "Today 13:00", effort: "40m" },
      { title: "Prepare tomorrow standup notes", due: "Today 17:00", effort: "25m" },
    ],
  },
  {
    title: "Later",
    subtitle: "Can be moved if overload appears",
    tasks: [
      { title: "Refine analytics event names", due: "Tue", effort: "30m" },
      { title: "Clean up old project tags", due: "Tue", effort: "30m" },
    ],
  },
]

const RISK_RADAR: RiskItem[] = [
  { title: "Launch auto-scheduling beta", due: "Wed, Apr 1", reason: "Critical dependency not closed", risk: 78 },
  { title: "Notification provider fallback", due: "Thu, Apr 2", reason: "Meeting load reducing implementation time", risk: 56 },
  { title: "Weekly recap automation", due: "Fri, Apr 3", reason: "Low complexity, high buffer", risk: 28 },
]

const COACH_ACTIONS: CoachAction[] = [
  { title: "Move API sync to 16:30", reason: "Protects your strongest focus slot at 14:00", impact: "Save ~40m context switching" },
  { title: "Split 'Beta launch checklist' into 4 subtasks", reason: "Large task currently has low completion confidence", impact: "Confidence increases from 62% to 86%" },
  { title: "Block 20m wrap-up at 17:40", reason: "You complete 22% more tasks when ending with review", impact: "Lower carry-over to tomorrow" },
]

const GOALS: GoalProgress[] = [
  { name: "Deep work hours", current: 14, target: 18 },
  { name: "Tasks completed", current: 31, target: 40 },
  { name: "On-time deadlines", current: 8, target: 10 },
]

const HEATMAP: HeatmapRow[] = [
  { label: "Mon", values: [1, 2, 3, 4, 2, 1, 0, 0] },
  { label: "Tue", values: [0, 1, 2, 3, 4, 2, 1, 0] },
  { label: "Wed", values: [0, 1, 1, 2, 3, 3, 2, 1] },
  { label: "Thu", values: [1, 2, 3, 3, 2, 2, 1, 0] },
  { label: "Fri", values: [0, 1, 2, 2, 2, 1, 0, 0] },
]

/* ─────────────────────────── Style maps ─────────────────────── */

const metricToneClass: Record<PersonalMetric["tone"], string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  neutral: "text-foreground",
}

const timelineTagClass: Record<TimelineItem["tag"], string> = {
  focus: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  meeting: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  task: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
}

const riskBarClass = (risk: number) => {
  if (risk >= 70) return "bg-rose-500"
  if (risk >= 45) return "bg-amber-500"
  return "bg-emerald-500"
}

const heatClass = (value: number) => {
  if (value <= 0) return "bg-muted"
  if (value === 1) return "bg-primary/20"
  if (value === 2) return "bg-primary/35"
  if (value === 3) return "bg-primary/55"
  return "bg-primary/75"
}

const goalPercent = (item: GoalProgress) =>
  Math.min(100, Math.round((item.current / item.target) * 100))

/* ─────────────────────────── Component ─────────────────────── */

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 md:px-8 pb-10">
      {/* top padding to clear the rounded header overlap */}
      <div className="pt-6" />

      {/* ── Quicklinks ────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Quicklinks</h2>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
            <Plus className="size-3.5" />
            Add quick link
          </Button>
        </div>
        {/* Empty state */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 py-10 flex flex-col items-center justify-center gap-3">
          <div className="size-10 rounded-full bg-muted flex items-center justify-center">
            <Link2 className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No quicklinks yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep important references, resources, or docs handy for your work
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Plus className="size-3.5" />
            Add quick link
          </Button>
        </div>
      </section>

      {/* ── Recents ───────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recents</h2>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
            All
          </Button>
        </div>
        <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
          {RECENT_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <span className="text-base">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{item.time}</span>
                <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-6 opacity-60" />

      {/* ── AI Metrics row ────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-3.5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Today</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {PERSONAL_METRICS.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-card p-3.5 hover:border-border/80 hover:shadow-sm transition-all duration-150"
            >
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-xl font-semibold ${metricToneClass[item.tone]}`}>{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main grid: Timeline + Now/Next/Later + Risk + Goals ── */}
      <div className="grid gap-4 xl:grid-cols-3 mb-6">
        <div className="space-y-4 xl:col-span-2">
          {/* Timeline */}
          <Card className="gap-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="size-3.5 text-muted-foreground" />
                My day timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Calendar + tasks arranged around your personal energy pattern.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {TODAY_TIMELINE.map((item) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className="flex gap-3 rounded-md border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <p className="text-[11px] font-medium text-muted-foreground w-28 shrink-0 pt-0.5">{item.time}</p>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${timelineTagClass[item.tag]}`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.context}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Now / Next / Later */}
          <Card className="gap-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="size-3.5 text-muted-foreground" />
                Now / Next / Later
              </CardTitle>
              <CardDescription className="text-xs">
                Dynamic task buckets to keep priorities obvious.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5 pb-4 md:grid-cols-3">
              {TIME_BUCKETS.map((bucket) => (
                <div key={bucket.title} className="rounded-md border border-border p-3">
                  <p className="text-xs font-semibold text-foreground">{bucket.title}</p>
                  <p className="mb-2.5 text-[11px] text-muted-foreground">{bucket.subtitle}</p>
                  <div className="space-y-1.5">
                    {bucket.tasks.map((task) => (
                      <div key={task.title} className="rounded bg-muted/50 px-2.5 py-2">
                        <p className="text-xs font-medium leading-snug">{task.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{task.due} · {task.effort}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Risk radar */}
          <Card className="gap-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ShieldAlert className="size-3.5 text-muted-foreground" />
                Risk radar
              </CardTitle>
              <CardDescription className="text-xs">
                Early warning for tasks likely to slip.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {RISK_RADAR.map((item) => (
                <div key={item.title} className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.reason}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>{item.due}</span>
                    <span>Risk {item.risk}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${riskBarClass(item.risk)}`}
                      style={{ width: `${item.risk}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly goals */}
          <Card className="gap-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Goal className="size-3.5 text-muted-foreground" />
                Weekly goals
              </CardTitle>
              <CardDescription className="text-xs">
                Your personalized success targets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pb-4">
              {GOALS.map((item) => {
                const percent = goalPercent(item)
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground tabular-nums">{item.current}/{item.target}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Heatmap + AI coach ─────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-3 mb-6">
        <Card className="gap-0 shadow-none xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              Weekly heatmap
            </CardTitle>
            <CardDescription className="text-xs">
              Workload intensity by your active hours this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pb-4">
            <div className="grid grid-cols-[44px_repeat(8,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground mb-0.5">
              <span />
              {["8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            {HEATMAP.map((row) => (
              <div key={row.label} className="grid grid-cols-[44px_repeat(8,minmax(0,1fr))] gap-1">
                <span className="text-[11px] text-muted-foreground self-center">{row.label}</span>
                {row.values.map((value, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: heatmap cells identified by position
                  <div key={i} className={`h-5 rounded-sm ${heatClass(value)}`} />
                ))}
              </div>
            ))}
            <p className="pt-1.5 text-[11px] text-muted-foreground">
              Tip: Thursday afternoon is your best uninterrupted focus zone.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BrainCircuit className="size-3.5 text-muted-foreground" />
              AI coach actions
            </CardTitle>
            <CardDescription className="text-xs">
              Personalized recommendations, one click away.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pb-4">
            {COACH_ACTIONS.map((item) => (
              <div key={item.title} className="rounded-md border border-border p-3 hover:bg-muted/30 transition-colors">
                <p className="text-xs font-semibold leading-snug">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{item.reason}</p>
                <p className="mt-1 text-[11px] text-primary font-medium">{item.impact}</p>
              </div>
            ))}
            <Button className="w-full h-8 text-xs" size="sm">
              Apply top recommendation
              <Zap className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick capture ──────────────────────────────────── */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <ListTodo className="size-3.5 text-muted-foreground" />
            Quick capture
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Plus className="size-3" />
              Add task
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <CalendarDays className="size-3" />
              Add event
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <TimerReset className="size-3" />
              Rebalance today
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Capture a thought, task, or reminder..."
            />
            <Button size="sm" className="h-8 text-xs">Save to inbox</Button>
          </div>
          <Separator className="my-3 opacity-60" />
          <div className="flex flex-wrap gap-2">
            {[
              "What should I finish before 5pm?",
              "Can you move low-priority events away from my focus slots?",
              "Show me why my risk score increased today",
            ].map((prompt) => (
              <span key={prompt} className="rounded-md bg-muted px-2.5 py-1 text-[11px] text-muted-foreground cursor-pointer hover:text-foreground hover:bg-accent transition-colors">
                {prompt}
              </span>
            ))}
          </div>

          {/* Status chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-400">
              <TriangleAlert className="size-3" />
              1 overdue task needs rescheduling
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-400">
              <Flame className="size-3" />
              5-day completion streak
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
              <CheckCircle2 className="size-3" />
              Personalization confidence: High
            </span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/60">
            Mock data only · Designed to maximize personal awareness and daily control
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
