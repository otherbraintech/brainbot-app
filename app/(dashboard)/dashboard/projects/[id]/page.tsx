import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects"
import { getOrders, getGlobalActiveOrders } from "@/lib/actions/orders"
import { OrdersList } from "@/components/orders/orders-list"
import { CreateOrderButton } from "@/components/orders/create-order-button"
import { CreateTargetButton } from "@/components/projects/create-target-button"
import { OrderQueueSheet } from "@/components/orders/order-queue-sheet"
import { Badge } from "@/components/ui/badge"
import { Hash, CheckCircle2, LayoutDashboard } from "lucide-react"

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
    const globalQueue = (await getGlobalActiveOrders()) as any[]

    const stats = orders.reduce((acc: any, order: any) => {
        const subItems = order.type === "COMENTARIO" ? order.genComments :
            order.type === "MEGUSTA" ? order.genLikes :
                order.type === "COMPARTIR" ? order.genShares :
                    order.type === "SEGUIMIENTO" ? order.genFollows :
                        order.type === "GENLIVE" ? order.genLives :
                            order.type === "MARKETPLACE" ? order.genMarketplaces :
                                order.genReports;

        const published = subItems?.filter((i: any) => i.status === "PUBLICADO" || i.status === "CONFIRMADO").length || 0;
        const generated = subItems?.filter((i: any) => i.status === "PUBLICADO" || i.status === "SINPUBLICAR").length || 0;

        acc.totalRequested += order.quantity;
        acc.totalCompleted += published;
        acc.totalGenerated += generated;
        return acc;
    }, { totalRequested: 0, totalCompleted: 0, totalGenerated: 0 });

    const completionRate = stats.totalRequested > 0 ? Math.round((stats.totalCompleted / stats.totalRequested) * 100) : 0;

    return (
        <div className="flex flex-col relative pb-20 -mt-2">
            {/* Meta Info Line (Pulled Up) */}
            <div className="flex items-center justify-end mb-1">
                {project.autoOrdersEnabled && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-0">
                        <span className="mr-1.5 h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        Monitoreo en Tiempo Real
                    </Badge>
                )}
            </div>

            {/* Simple Integrated Header (Tighter) */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between border-b border-border/40 pb-5">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tighter text-foreground leading-none">
                            <span className="opacity-30">PROYECTO: </span> {project.name}
                        </h1>
                        {project.stance && (
                            <Badge
                                className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0 border-none h-4 ${
                                    project.stance === "AGAINST"
                                        ? "bg-red-500 text-white"
                                        : "bg-emerald-500 text-white"
                                }`}
                            >
                                {project.stance === "AGAINST" ? "Contra" : "Favor"}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:gap-10">
                    <div className="flex items-center gap-6">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 opacity-30">
                                <Hash className="inline h-2 w-2 mr-1" /> Solicitadas
                            </span>
                            <span className="text-xl font-bold tabular-nums tracking-tighter text-foreground/80">
                                {stats.totalRequested}
                            </span>
                        </div>
                        <div className="flex flex-col border-l pl-6 border-border/40">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 opacity-30">
                                <CheckCircle2 className="inline h-2 w-2 mr-1 text-emerald-500" /> Completadas
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold tabular-nums tracking-tighter text-emerald-600">
                                    {stats.totalCompleted}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-bold opacity-20">
                                    / {stats.totalGenerated || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col min-w-[120px]">
                         <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-30">
                                Eficiencia
                            </span>
                            <span className="text-xs font-bold tabular-nums text-indigo-600">
                                {completionRate}%
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-1000" 
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Flat Actions Bar (Tighter) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-border/40">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold tracking-tight text-foreground uppercase leading-none">
                         Órdenes del Proyecto
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1">
                         GESTIÓN Y MONITOREO
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <OrderQueueSheet queueOrders={globalQueue} />
                    <CreateOrderButton projectId={id} />
                    <CreateTargetButton project={project as any} fullWidth={false} />
                </div>
            </div>

            {/* Standard Orders List */}
            <div className="relative pt-4">
                <OrdersList orders={orders} projectId={id} globalQueue={globalQueue} />
            </div>
        </div>
    )
}
