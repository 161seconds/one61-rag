import { createFileRoute } from "@tanstack/react-router";
import { RouteLoading } from "@/modules/apps";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("@/modules/home/components/page"));

export const Route = createFileRoute("/_app/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Suspense fallback={<RouteLoading />}>
			<HomePage />
		</Suspense>
	);
}
