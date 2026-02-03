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
import { getCurrentUser } from "@/lib/actions/user"
import { getProjects } from "@/lib/actions/projects"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    const projects = (await getProjects()) as any[]

    return (
        <SidebarProvider>
            <AuthErrorModal user={user} />
            <AppSidebar user={user} projects={projects} />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <DynamicBreadcrumb />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
