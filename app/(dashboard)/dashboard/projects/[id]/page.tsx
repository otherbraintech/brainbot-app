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

    const activeOrdersCount = orders.filter((o: any) => o.status === "GENERADA").length;
    const pausedOrdersCount = orders.filter((o: any) => o.status === "PAUSADA").length;
    const completedOrdersCount = orders.filter((o: any) => o.status === "COMPLETADA").length;
    const cancelledOrdersCount = orders.filter((o: any) => o.status === "CANCELADA").length;
    const pendingOrdersCount = orders.filter((o: any) => o.status === "LISTA" || o.status === "GENERANDO" || o.status === "REINTENTAR").length;

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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 border-b border-border/40">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black tracking-tight text-foreground uppercase leading-none">
                            Órdenes del Proyecto
                        </h2>
                        <p className="text-[8px] font-medium text-muted-foreground/40 uppercase tracking-[0.2em] mt-1">
                            GESTIÓN Y MONITOREO
                        </p>
                    </div>

                    {/* Order Status Counters */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        {activeOrdersCount > 0 && (
                            <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50 flex items-center gap-1.5 rounded-full px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] uppercase font-bold">{activeOrdersCount} Activas</span>
                            </Badge>
                        )}
                        {pausedOrdersCount > 0 && (
                            <Badge variant="outline" className="bg-amber-50/50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50 flex items-center gap-1.5 rounded-full px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] uppercase font-bold">{pausedOrdersCount} Pausadas</span>
                            </Badge>
                        )}
                        {pendingOrdersCount > 0 && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50 flex items-center gap-1.5 rounded-full px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span className="text-[10px] uppercase font-bold">{pendingOrdersCount} En Cola</span>
                            </Badge>
                        )}
                        {completedOrdersCount > 0 && (
                            <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1.5 rounded-full px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] uppercase font-bold">{completedOrdersCount} Completadas</span>
                            </Badge>
                        )}
                        {cancelledOrdersCount > 0 && (
                            <Badge variant="outline" className="bg-red-50/50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/50 dark:border-red-900/50 flex items-center gap-1.5 rounded-full px-2.5 py-0.5">
                                <span className="text-[10px] uppercase font-bold">{cancelledOrdersCount} Canceladas</span>
                            </Badge>
                        )}
                    </div>
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
