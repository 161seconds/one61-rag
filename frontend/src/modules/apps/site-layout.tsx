import { useCallback, useLayoutEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@aqua-calendar/ui/components/dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@aqua-calendar/ui/components/avatar";
import { cn } from "@aqua-calendar/ui/lib/utils";
import {
	Bell,
	Check,
	ChevronDown,
	HelpCircle,
	Laptop,
	LogOut,
	Moon,
	Palette,
	Plus,
	Search,
	Settings,
	Sun,
	User,
} from "lucide-react";
import {
	useSignOut,
	authQueryKeys,
	type SessionResponse,
} from "@/modules/auth";
import { useTheme } from "@/modules/apps/theme-provider";
import { queryClient } from "@/libs";

/* ─── Workspace / site selector ──────────────────────── */

const SITES = [
	{ id: "1", name: "quy1411", plan: "Business", color: "bg-violet-500" },
	{ id: "2", name: "personal", plan: "Free", color: "bg-sky-500" },
];

function SiteSelect() {
	const [current, setCurrent] = useState(SITES[0] ?? SITES[1]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-foreground hover:bg-accent transition-colors outline-none cursor-pointer shrink-0"
				>
					<span
						className={cn(
							"flex size-5 items-center justify-center rounded text-[10px] font-bold text-white shrink-0",
							current.color,
						)}
					>
						{current.name.charAt(0).toUpperCase()}
					</span>
					<span className="max-w-[100px] truncate">{current.name}</span>
					<ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-64" align="start" sideOffset={6}>
				<div className="px-2 pt-1.5 pb-2">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">
						Workspaces
					</p>
					{SITES.map((site) => (
						<button
							key={site.id}
							type="button"
							onClick={() => setCurrent(site)}
							className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer"
						>
							<span
								className={cn(
									"flex size-6 items-center justify-center rounded text-xs font-bold text-white shrink-0",
									site.color,
								)}
							>
								{site.name.charAt(0).toUpperCase()}
							</span>
							<div className="flex-1 min-w-0 text-left">
								<p className="text-xs font-semibold truncate">{site.name}</p>
								<p className="text-[10px] text-muted-foreground">{site.plan}</p>
							</div>
							{current.id === site.id && (
								<Check className="size-3.5 text-primary shrink-0" />
							)}
						</button>
					))}
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer">
					<Plus className="mr-2 size-3.5" />
					<span className="text-sm">Add workspace</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/* ─── User menu ──────────────────────────────────────── */

function SiteUserMenu() {
	const session = queryClient.getQueryData<SessionResponse>(
		authQueryKeys.session(),
	);
	const userData = session?.data?.user;
	const { handleSignOut, isPending } = useSignOut();
	const { setTheme, theme } = useTheme();

	const name = userData?.displayName || "User";
	const initials = name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex size-7 shrink-0 items-center justify-center rounded-full outline-none cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
					aria-label="User menu"
				>
					<Avatar className="size-7">
						<AvatarImage src={userData?.photoURL ?? undefined} alt={name} />
						<AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
							{initials}
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56" align="end" sideOffset={8}>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-2 py-2">
						<Avatar className="size-8 rounded-lg shrink-0">
							<AvatarImage src={userData?.photoURL ?? undefined} />
							<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="grid text-xs leading-tight">
							<span className="truncate font-semibold">{name}</span>
							<span className="truncate text-muted-foreground text-[10px]">
								{userData?.email}
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer text-sm" asChild>
					<Link to="/settings/preferences">
						<User className="mr-2 size-3.5" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem className="cursor-pointer text-sm" asChild>
					<Link to="/settings/preferences">
						<Settings className="mr-2 size-3.5" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="cursor-pointer text-sm">
						{theme === "light" ? (
							<Sun className="mr-2 size-3.5" />
						) : theme === "dark" ? (
							<Moon className="mr-2 size-3.5" />
						) : (
							<Laptop className="mr-2 size-3.5" />
						)}
						Theme
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem
								onClick={() => setTheme("light")}
								className="text-sm"
							>
								<Sun className="mr-2 size-3.5" />
								Light
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setTheme("dark")}
								className="text-sm"
							>
								<Moon className="mr-2 size-3.5" />
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => setTheme("system")}
								className="text-sm"
							>
								<Laptop className="mr-2 size-3.5" />
								System
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
					onClick={handleSignOut}
					disabled={isPending}
				>
					<LogOut className="mr-2 size-3.5" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/* ─── Accent color picker ─────────────────────────────── */

const ACCENT_PRESETS = [
	{ id: "blue", label: "Blue", oklch: "oklch(0.6068 0.2124 264.3906)" },
	{ id: "violet", label: "Violet", oklch: "oklch(0.606 0.237 292.7)" },
	{ id: "emerald", label: "Emerald", oklch: "oklch(0.627 0.194 149.6)" },
	{ id: "amber", label: "Amber", oklch: "oklch(0.769 0.189 70.1)" },
	{ id: "orange", label: "Orange", oklch: "oklch(0.635 0.205 40)" },
	{ id: "rose", label: "Rose", oklch: "oklch(0.645 0.246 16.4)" },
	{ id: "pink", label: "Pink", oklch: "oklch(0.656 0.241 354.3)" },
	{ id: "teal", label: "Teal", oklch: "oklch(0.704 0.14 182.5)" },
	{ id: "slate", label: "Slate", oklch: "oklch(0.446 0.03 256.8)" },
];

const ACCENT_KEY = "aqua:accent";

function applyAccent(oklch: string) {
	const root = document.documentElement;
	root.style.setProperty("--primary", oklch);
	root.style.setProperty("--ring", oklch);
	root.style.setProperty("--sidebar-primary", oklch);
	root.style.setProperty("--sidebar-ring", oklch);
	root.style.setProperty("--chart-1", oklch);
}

function useAccentColor() {
	const [accentId, setAccentId] = useState<string>(
		() => localStorage.getItem(ACCENT_KEY) ?? "blue",
	);

	useLayoutEffect(() => {
		const preset =
			ACCENT_PRESETS.find((p) => p.id === accentId) ?? ACCENT_PRESETS[0];
		if (preset) applyAccent(preset.oklch);
	}, [accentId]);

	const setAccent = useCallback((id: string) => {
		localStorage.setItem(ACCENT_KEY, id);
		setAccentId(id);
	}, []);

	return { accentId, setAccent };
}

function AccentPicker() {
	const { accentId, setAccent } = useAccentColor();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Change accent color"
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
				>
					<Palette className="size-4" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44 p-2">
				<p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Accent color
				</p>
				<div className="grid grid-cols-3 gap-1">
					{ACCENT_PRESETS.map((preset) => (
						<button
							key={preset.id}
							type="button"
							title={preset.label}
							onClick={() => setAccent(preset.id)}
							className={cn(
								"flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] transition-colors",
								"hover:bg-accent text-muted-foreground hover:text-foreground",
								accentId === preset.id && "bg-accent text-foreground",
							)}
						>
							<span
								className="size-5 rounded-full border border-black/10 dark:border-white/10"
								style={{ background: preset.oklch }}
							/>
							{preset.label}
						</button>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/* ─── Site Header ─────────────────────────────────────── */

function SiteHeader() {
	return (
		<header className="relative flex h-11 shrink-0 items-center gap-2 border-b border-border/60 bg-sidebar px-3 z-30">
			{/* Left: workspace / site selector */}
			<div className="relative z-10">
				<SiteSelect />
			</div>

			<div className="w-px h-4 bg-border/60 mx-1 shrink-0" />

			{/* Center: global search */}
			<div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-3">
				<div className="pointer-events-auto relative w-full">
					<Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
					<input
						className={cn(
							"h-7 w-full rounded-md pl-8 pr-10 text-xs text-foreground",
							"bg-background border border-border",
							"placeholder:text-muted-foreground outline-none",
							"transition-colors focus:border-primary/50 focus:ring-0",
						)}
						placeholder="Search commands..."
						aria-label="Global search"
					/>
					<kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-muted-foreground/40 select-none">
						⌘K
					</kbd>
				</div>
			</div>

			{/* Right: action icons + user */}
			<div className="relative z-10 ml-auto flex items-center gap-1 shrink-0">
				<button
					type="button"
					aria-label="Notifications"
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
				>
					<Bell className="size-4" />
				</button>
				<button
					type="button"
					aria-label="Help"
					className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
				>
					<HelpCircle className="size-4" />
				</button>

				<AccentPicker />

				<div className="w-px h-4 bg-border/60 mx-0.5" />

				<SiteUserMenu />
			</div>
		</header>
	);
}

/* ─── Site Layout ─────────────────────────────────────── */

interface SiteLayoutProps {
	children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
	return (
		<div className="flex h-svh flex-col overflow-hidden overscroll-none bg-sidebar">
			<SiteHeader />
			<div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
				{children}
			</div>
		</div>
	);
}
