import { useCallback, useEffect, useRef } from "react";
import { cn } from "@aqua-calendar/ui/lib/utils";
import { AppSidebar } from "@/modules/apps/sidebar/app-sidebar";
import { AppHeader } from "@/modules/apps/app-header";
import { useSidebarState } from "@/modules/apps/hooks/use-sidebar-state";

const COLLAPSED_WIDTH = 52; // px — icon-only mode

interface AppLayoutProps {
	children: React.ReactNode;
	pageKey?: string;
}

export function AppLayout({ children, pageKey }: AppLayoutProps) {
	const {
		isCollapsed,
		sidebarWidth,
		isMobileOpen,
		setSidebarWidth,
		expand,
		collapse,
		closeMobile,
		toggleMobile,
	} = useSidebarState();

	/* ── Close mobile drawer on route change ── */
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional route-reset
	useEffect(() => {
		closeMobile();
	}, [pageKey]);

	/* ── Close mobile drawer on resize to desktop ── */
	useEffect(() => {
		const fn = () => {
			if (window.innerWidth >= 1024) closeMobile();
		};
		window.addEventListener("resize", fn);
		return () => window.removeEventListener("resize", fn);
	}, [closeMobile]);

	/* ── Lock body scroll while mobile drawer open ── */
	useEffect(() => {
		document.body.style.overflow = isMobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileOpen]);

	/* ── Sidebar resize drag ── */
	const isResizingRef = useRef(false);
	const startXRef = useRef(0);
	const startWidthRef = useRef(sidebarWidth);

	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			if (isCollapsed) return;
			isResizingRef.current = true;
			startXRef.current = e.clientX;
			startWidthRef.current = sidebarWidth;
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			const onMove = (ev: MouseEvent) => {
				if (!isResizingRef.current) return;
				setSidebarWidth(startWidthRef.current + ev.clientX - startXRef.current);
			};
			const onUp = () => {
				isResizingRef.current = false;
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
				document.removeEventListener("mousemove", onMove);
				document.removeEventListener("mouseup", onUp);
			};
			document.addEventListener("mousemove", onMove);
			document.addEventListener("mouseup", onUp);
		},
		[isCollapsed, sidebarWidth, setSidebarWidth],
	);

	const currentWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

	return (
		<div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
			{/* ── Desktop sidebar ─────────────────────────────── */}
			<aside
				style={{ width: currentWidth }}
				className={cn(
					"hidden lg:flex flex-col shrink-0",
					"bg-background overflow-hidden",
					isCollapsed && "border-r border-border/60",
					/* Only animate during collapse/expand toggle, not while resizing */
					!isResizingRef.current &&
						"transition-[width] duration-250 ease-in-out",
				)}
			>
				<AppSidebar
					isCollapsed={isCollapsed}
					onCollapse={collapse}
					onClose={closeMobile}
				/>
			</aside>

			{/* ── Resize handle (desktop only, hidden when collapsed) ── */}
			{!isCollapsed && (
				<div
					aria-hidden="true"
					className={cn(
						"group hidden lg:flex w-1 shrink-0 cursor-col-resize",
						"items-stretch relative z-10",
					)}
					onMouseDown={handleResizeStart}
				>
					{/* Visual indicator line */}
					<div className="absolute inset-y-0 left-0 w-px bg-border/60 group-hover:bg-primary/50 group-active:bg-primary transition-colors duration-150" />
					{/* Wider invisible hit target */}
					<div className="w-full" />
				</div>
			)}

			{/* ── Mobile overlay drawer ────────────────────────── */}
			<div
				className={cn(
					"fixed inset-0 z-50 lg:hidden",
					isMobileOpen ? "pointer-events-auto" : "pointer-events-none",
				)}
				aria-hidden={!isMobileOpen}
			>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled by focus trap */}
				<div
					className={cn(
						"absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
						isMobileOpen ? "opacity-100" : "opacity-0",
					)}
					onClick={closeMobile}
				/>
				<aside
					className={cn(
						"absolute inset-y-0 left-0 z-10 flex flex-col bg-background shadow-2xl",
						"transition-transform duration-300 ease-out will-change-transform",
						isMobileOpen ? "translate-x-0" : "-translate-x-full",
					)}
					style={{ width: sidebarWidth }}
				>
					<AppSidebar
						isCollapsed={false}
						onCollapse={collapse}
						onClose={closeMobile}
						showCloseButton
					/>
				</aside>
			</div>

			{/* ── Content column ───────────────────────────────── */}
			<div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden bg-background">
				<AppHeader
					isCollapsed={isCollapsed}
					isMobileOpen={isMobileOpen}
					onExpandSidebar={expand}
					onToggleMobile={toggleMobile}
				/>
				<main
					key={pageKey}
					className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-none [scrollbar-gutter:stable] page-enter"
				>
					{children}
				</main>
			</div>
		</div>
	);
}
