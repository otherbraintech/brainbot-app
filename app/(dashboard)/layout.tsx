import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthErrorModal } from "@/components/auth-error-modal"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { ChangelogDialog } from "@/components/changelog-dialog"
import { getCurrentUser } from "@/lib/actions/user"
import { getProjects } from "@/lib/actions/projects"
import { getActiveOrders } from "@/lib/actions/orders"
import { ActiveOrderIndicator } from "@/components/orders/active-order-indicator"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    const projects = (await getProjects()) as any[]
    const activeOrders = await getActiveOrders()

    return (
        <SidebarProvider>
            <AuthErrorModal user={user} />
            <ChangelogDialog />
            <AppSidebar user={user} projects={projects} />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <DynamicBreadcrumb />
                    <ActiveOrderIndicator orders={activeOrders} />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
