import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { getOrders } from "@/lib/actions/orders"
import { OrdersList } from "@/components/orders/orders-list"
import { CreateOrderButton } from "@/components/orders/create-order-button"
import { CreateTargetButton } from "@/components/projects/create-target-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const project = await getProject(id)

    if (!project) {
        notFound()
    }

    const orders = (await getOrders(id)) as any[]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/projects?list=1">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold truncate">Proyecto: {project.name}</h1>
                            {project.stance && (
                                <Badge
                                    className={
                                        project.stance === "AGAINST"
                                            ? "bg-red-600 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-500"
                                            : "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-500"
                                    }
                                >
                                    {project.stance === "AGAINST" ? "En Contra" : "A Favor"}
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            Aquí puedes crear y gestionar las órdenes de este proyecto.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                    <CreateOrderButton projectId={id} />
                    <CreateTargetButton project={project as any} fullWidth={false} />
                </div>
            </div>

            <OrdersList orders={orders} projectId={id} />
        </div>
    )
}
