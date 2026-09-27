import { Link } from "@tanstack/react-router"
import {
  CalendarDays,
  Zap,
  BrainCircuit,
  Shield,
  Bell,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  Rocket,
  MousePointerClick,
  Globe,
  Lock,
  RefreshCw,
} from "lucide-react"

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Scheduling",
    description:
      "Intelligent engine that auto-schedules tasks around your energy peaks, meetings, and priorities.",
  },
  {
    icon: Target,
    title: "Now / Next / Later",
    description:
      "Dynamic task buckets that keep your priorities obvious and your day laser-focused.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Context-aware reminders that surface at the right moment — not when you're deep in focus.",
  },
  {
    icon: BarChart3,
    title: "Personal Heatmaps",
    description:
      "Visualise your workload intensity and spot focus patterns across the week at a glance.",
  },
  {
    icon: Shield,
    title: "Risk Radar",
    description:
      "Early warnings for tasks likely to slip so you can intervene before deadlines sneak up.",
  },
  {
    icon: Users,
    title: "Team Calendar Sync",
    description:
      "Connect Google, Outlook and Jira — see your whole team's availability without leaving the app.",
  },
]

const TESTIMONIALS = [
  {
    name: "Linh Nguyen",
    role: "Engineering Lead · FPT Software",
    avatar: "LN",
    quote:
      "Aqua Calendar replaced three tools for me. The AI coaching alone has saved me hours every week.",
    rating: 5,
  },
  {
    name: "Minh Tran",
    role: "Product Manager · VNG",
    avatar: "MT",
    quote:
      "The risk radar caught a critical deadline I had completely lost track of. Genuinely feels like having a personal assistant.",
    rating: 5,
  },
  {
    name: "Hana Vo",
    role: "Designer · Axon Active",
    avatar: "HV",
    quote:
      "Clean, fast, and actually enjoyable to use. The calendar drag-and-drop is buttery smooth.",
    rating: 5,
  },
  {
    name: "Thanh Le",
    role: "CTO · Holistics",
    avatar: "TL",
    quote:
      "We onboarded the entire engineering team in one afternoon. The Jira sync is a game-changer for sprint planning.",
    rating: 5,
  },
  {
    name: "Bao Pham",
    role: "Founder · Buildify.vn",
    avatar: "BP",
    quote:
      "I've tried Notion, Linear, and Todoist. Nothing comes close to Aqua for daily execution. The AI suggestions are uncannily accurate.",
    rating: 5,
  },
  {
    name: "Mai Dang",
    role: "Head of Operations · Tiki",
    avatar: "MD",
    quote:
      "The heatmaps finally gave me visibility into where our team's time goes. We cut context-switching by 40%.",
    rating: 5,
  },
]

const TIMELINE_PREVIEW = [
  { time: "08:30", title: "Deep work: API integration", tag: "focus", color: "emerald" },
  { time: "10:15", title: "Design review — task panel", tag: "meeting", color: "sky" },
  { time: "14:00", title: "Build reminder fallback", tag: "focus", color: "emerald" },
  { time: "15:30", title: "Standup prep", tag: "task", color: "violet" },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: MousePointerClick,
    title: "Connect your tools",
    description:
      "Link Google Calendar, Outlook, Jira, or any iCal source in seconds. Aqua pulls in all your events, tasks, and deadlines automatically.",
  },
  {
    step: "02",
    icon: BrainCircuit,
    title: "AI builds your day",
    description:
      "Our scheduling engine analyses your energy patterns, deadline proximity, and meeting density to create the optimal daily plan.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Execute with clarity",
    description:
      "Work through your Now/Next/Later queue with zero decision fatigue. The AI adjusts your plan in real-time as things change.",
  },
]

const STATS = [
  { value: "12,000+", label: "Active users", icon: Users },
  { value: "4.2 hrs", label: "Time saved per week", icon: Clock },
  { value: "94%", label: "User satisfaction", icon: TrendingUp },
  { value: "200+", label: "Companies onboarded", icon: Globe },
]

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals just getting started.",
    features: [
      "1 calendar connection",
      "Now / Next / Later queue",
      "Basic notifications",
      "7-day timeline view",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professionals who want the full AI experience.",
    features: [
      "Unlimited calendar connections",
      "AI daily scheduling",
      "Risk radar & heatmaps",
      "Smart context-aware notifications",
      "Google, Outlook & Jira sync",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    price: "$8",
    period: "per user/month",
    description: "Visibility and coordination across your whole squad.",
    features: [
      "Everything in Pro",
      "Team calendar overlay",
      "Shared task boards",
      "Admin dashboard",
      "SSO / SAML",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
]

const INTEGRATIONS = [
  { name: "Google Calendar", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { name: "Outlook", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { name: "Jira", color: "bg-blue-700/10 text-blue-700 dark:text-blue-300" },
  { name: "Slack", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { name: "Notion", color: "bg-gray-500/10 text-gray-700 dark:text-gray-300" },
  { name: "Linear", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { name: "GitHub", color: "bg-gray-500/10 text-gray-700 dark:text-gray-300" },
  { name: "Asana", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
]

/* ─────────────────────────────────────────────
   Sub-components
 ───────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
      <div className="glass-card flex items-center justify-between rounded-2xl px-5 py-3">
        {/* Logo */}
        <Link to="/about" className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CalendarDays className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Aqua Calendar
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">How it works</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer">Pricing</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground cursor-pointer hidden sm:block"
          >
            Sign in
          </Link>
        </div>
      </div>
    </nav>
  )
}


function HeroSection() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16">

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
        <Sparkles className="size-3.5" />
        AI-powered personal command center
      </div>

      {/* Headline */}
      <h1
        className="mb-5 max-w-3xl text-center text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Your calendar,{" "}
        <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
          supercharged
        </span>{" "}
        by AI
      </h1>

      <p className="mb-8 max-w-xl text-center text-lg text-muted-foreground">
        Stop juggling apps. Aqua Calendar merges your calendar, tasks, and AI
        coaching into one focused workspace — so you actually finish what
        matters.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="#how-it-works"
          id="hero-how-it-works"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted cursor-pointer"
        >
          <LayoutDashboard className="size-4" />
          See how it works
        </a>
      </div>

      {/* Trust signals */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="size-3.5 text-emerald-500" />
          Free plan available
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="size-3.5 text-emerald-500" />
          No credit card required
        </span>
        <span className="flex items-center gap-1.5">
          <Lock className="size-3.5 text-emerald-500" />
          SOC-2 compliant
        </span>
      </div>

      {/* Scroll hint */}
      <div className="mt-16 flex flex-col items-center gap-1.5 text-muted-foreground/50">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-current p-1">
          <div className="h-2 w-1 animate-bounce rounded-full bg-current" />
        </div>
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="relative overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card/80 p-6 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" />
                </div>
                <p className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            From chaos to clarity in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Three simple steps and your AI-powered workspace is live — no migration required.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute left-1/2 top-12 hidden h-px w-2/3 -translate-x-1/2 border-t border-dashed border-border lg:block" />

          <div className="grid gap-6 lg:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Step badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <span className="text-4xl font-black text-muted-foreground/15 select-none">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Everything you need, nothing you don't
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            A thoughtfully integrated set of tools that work together so you
            can work smarter.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 cursor-default"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
                  <Icon className="size-5" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function DemoPreviewSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Demo
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your day, visualised
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            A smart timeline merges calendar events and tasks around your personal
            energy pattern — not just what's on your calendar.
          </p>
        </div>

        {/* Mock dashboard card */}
        <div className="glass-card rounded-3xl p-6 shadow-xl shadow-black/5">
          {/* Header bar */}
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Mon, Apr 7 · AI Plan active</p>
              <p className="text-base font-semibold">Good morning, Alex</p>
            </div>
            <div className="flex gap-2">
              <div className="rounded-lg border bg-muted/60 px-3 py-1.5 text-xs font-medium">
                Ask AI
              </div>
              <div className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                Re-optimise
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Focus score", value: "82/100", tone: "text-emerald-600 dark:text-emerald-400" },
              { label: "Pressure", value: "Medium", tone: "text-amber-600 dark:text-amber-400" },
              { label: "Energy align", value: "Strong", tone: "text-emerald-600 dark:text-emerald-400" },
              { label: "Switches", value: "7 today", tone: "text-muted-foreground" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border bg-background/60 p-3"
              >
                <p className="mb-1 text-[10px] text-muted-foreground">{m.label}</p>
                <p className={`text-sm font-bold ${m.tone}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Today's timeline</p>
            </div>
            <div className="space-y-2">
              {TIMELINE_PREVIEW.map((item) => (
                <div
                  key={item.time}
                  className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border bg-card/60 px-3 py-2"
                >
                  <span className="text-[10px] font-medium text-muted-foreground">{item.time}</span>
                  <span className="truncate text-xs font-medium">{item.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.color === "emerald"
                        ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                        : item.color === "sky"
                        ? "bg-sky-500/12 text-sky-700 dark:text-sky-300"
                        : "bg-violet-500/12 text-violet-700 dark:text-violet-300"
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function IntegrationsSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Integrations
        </p>
        <h2
          className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Works with your existing stack
        </h2>
        <p className="mx-auto mb-12 max-w-md text-muted-foreground">
          Connect all the tools you already use. Aqua brings everything into one unified view.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.name}
              className={`flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.03] hover:shadow-sm cursor-default ${integration.color}`}
            >
              <RefreshCw className="size-3.5 opacity-70" />
              {integration.name}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          + 50 more via Zapier & webhooks
        </p>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Loved by busy professionals
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Join thousands of teams who've reclaimed focus and shipped more with Aqua.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Start free, upgrade when you're ready. No surprises, cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-200 ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <p className="mb-1 text-sm font-semibold text-muted-foreground">{plan.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className="size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                id={`pricing-${plan.name.toLowerCase()}`}
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                Learn more
                <ArrowRight className="size-4" />
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative overflow-hidden px-4 py-28">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute left-1/3 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
          <Zap className="size-3.5" />
          Start in under 2 minutes
        </div>
        <h2
          className="mb-5 text-4xl font-bold tracking-tight md:text-5xl"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Ready to take control of your day?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join thousands of professionals who've reclaimed their focus with Aqua Calendar.
          Free to start, no credit card needed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-8 py-4 text-base font-semibold text-foreground transition-all duration-200 hover:bg-muted cursor-pointer"
          >
            View pricing
          </a>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          14-day trial · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-8 sm:flex-row">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarDays className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">Aqua Calendar</span>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground leading-relaxed">
              AI-powered calendar and task management for focused professionals.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</p>
              <div className="space-y-2">
                <a href="#features" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Features</a>
                <a href="#pricing" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
                <a href="#how-it-works" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">How it works</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Footer</p>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">About</a>
                <a href="#" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Blog</a>
                <a href="#" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Support</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
                <a href="#" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</a>
                <Link to="/login" className="block text-xs text-muted-foreground transition-colors hover:text-foreground">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aqua Calendar. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with care in Vietnam 🇻🇳
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   Global background layer
───────────────────────────────────────────── */
function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background" aria-hidden>
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Dynamic Animated Blobs (Aurora effect) */}
      <div className="absolute inset-0 opacity-40 mix-blend-normal dark:mix-blend-screen dark:opacity-30">
        <div
          className="landing-blob absolute -top-40 -left-10 size-[600px] rounded-full bg-primary/30 blur-3xl"
          style={{ animationDelay: "0s", animationDuration: "15s" }}
        />
        <div
          className="landing-blob absolute top-20 -right-20 size-[500px] rounded-full bg-sky-400/30 blur-3xl"
          style={{ animationDelay: "-5s", animationDuration: "20s" }}
        />
        <div
          className="landing-blob absolute top-1/2 left-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]"
          style={{ animationDelay: "-10s", animationDuration: "25s" }}
        />
        <div
          className="landing-blob absolute -bottom-40 -left-20 size-[500px] rounded-full bg-amber-400/20 blur-3xl"
          style={{ animationDelay: "-15s", animationDuration: "18s" }}
        />
        <div
          className="landing-blob absolute -bottom-20 -right-10 size-[600px] rounded-full bg-primary/20 blur-3xl"
          style={{ animationDelay: "-7s", animationDuration: "22s" }}
        />
      </div>

      {/* Radial gradient mask to fade grid at the edges */}
      <div className="absolute inset-0 bg-background/40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Subtle vignettes */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="relative min-h-svh">
      <PageBackground />
      <div className="relative z-10 flex flex-col bg-transparent">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DemoPreviewSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  )
}
