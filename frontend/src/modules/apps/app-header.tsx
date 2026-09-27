import { cn } from "@aqua-calendar/ui/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import { Menu, PanelLeftOpen } from "lucide-react";
import { getActiveSidebarSection } from "@/modules/apps/sidebar/sidebar-navigation";

/* ─── Page title from route ──────────────────────────── */

function usePageTitle() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return getActiveSidebarSection(pathname)?.label ?? "Home";
}

/* ─── App Header ─────────────────────────────────────── */

interface AppHeaderProps {
	/** Desktop sidebar is in icon-only (collapsed) mode */
	isCollapsed: boolean;
	/** Mobile drawer is currently open */
	isMobileOpen: boolean;
	/** Expand the desktop sidebar */
	onExpandSidebar: () => void;
	/** Toggle the mobile drawer */
	onToggleMobile: () => void;
}

export function AppHeader({
	isCollapsed,
	isMobileOpen,
	onExpandSidebar,
	onToggleMobile,
}: AppHeaderProps) {
	const pageTitle = usePageTitle();

	return (
		<header className="relative flex h-10 shrink-0 items-center gap-2 border-b border-border/60 bg-background px-3 z-20">
			{/* ── Sidebar toggles ──────────────────────────────── */}

			{/* Mobile hamburger — always on mobile */}
			<button
				type="button"
				onClick={onToggleMobile}
				aria-label={isMobileOpen ? "Close menu" : "Open menu"}
				aria-expanded={isMobileOpen}
				className={cn(
					"lg:hidden flex size-7 items-center justify-center rounded-md",
					"text-muted-foreground hover:text-foreground hover:bg-accent",
					"transition-colors duration-150",
					isMobileOpen && "bg-accent text-foreground",
				)}
			>
				<Menu className="size-4" />
			</button>

			{/* Desktop expand — only visible when sidebar is collapsed */}
			{isCollapsed && (
				<button
					type="button"
					onClick={onExpandSidebar}
					aria-label="Expand sidebar"
					className="hidden lg:flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
				>
					<PanelLeftOpen className="size-4" />
				</button>
			)}

			{/* ── Page title ───────────────────────────────────── */}
			<h1 className="text-sm font-semibold text-foreground select-none truncate">
				{pageTitle}
			</h1>

			{/* ── Right slot — reserved for page-specific actions ── */}
			<div
				className="ml-auto flex items-center gap-2"
				id="app-header-actions"
			/>
		</header>
	);
}
