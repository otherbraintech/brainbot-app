"use client"

import { useMemo } from "react"
import { ListChecks, ExternalLink, Activity, Hash } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const ORDER_TYPE_LABELS: Record<string, { icon: any, label: string }> = {
    COMENTARIO: { icon: Activity, label: "Comentario" },
    MEGUSTA: { icon: Activity, label: "Me Gusta" },
    COMPARTIR: { icon: Activity, label: "Compartir" },
    SEGUIMIENTO: { icon: Activity, label: "Seguimiento" },
    GENLIVE: { icon: Activity, label: "Gen Live" },
    MARKETPLACE: { icon: Activity, label: "Marketplace" },
    REPORT: { icon: Activity, label: "Reporte" }
}

export function OrderQueueSheet({ queueOrders }: { queueOrders: any[] }) {
    const router = useRouter()

    const groupedQueueOrders = useMemo(() => {
        const groups: Record<string, { name: string, id: string, orders: any[] }> = {}
        queueOrders.forEach((order: any) => {
            const projectId = order.project?.id || 'unknown'
            if (!groups[projectId]) {
                groups[projectId] = {
                    name: order.project?.name || 'Sin Proyecto',
                    id: projectId,
                    orders: []
                }
            }
            groups[projectId].orders.push(order)
        })
        return Object.values(groups)
    }, [queueOrders])

    return (
        <Sheet>
            <SheetTrigger {...({ asChild: true } as any)}>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto text-[10px] gap-2 border-indigo-200/60 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold uppercase tracking-widest shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                    <ListChecks className="h-3.5 w-3.5" />
                    Ver Cola
                    {queueOrders.length > 0 && (
                        <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm text-[8px] font-black">{queueOrders.length}</span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md p-0 flex flex-col" {...({ side: "right" } as any)}>
                <div className="p-6 pb-4 border-b bg-muted/10">
                    <SheetHeader className="space-y-1 text-left">
                        <SheetTitle className="flex items-center gap-2 text-xl font-bold" {...({} as any)}>
                            <ListChecks className="h-6 w-6 text-indigo-600" />
                            Cola de Órdenes
                        </SheetTitle>
                        <SheetDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground/70" {...({} as any)}>
                            Listo para Procesar (GENERADAS)
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <ScrollArea className="flex-1 min-h-0 p-6" {...({} as any)}>
                    <div className="space-y-4 pr-1">
                        {groupedQueueOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                                <Activity className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No hay órdenes en cola actualmente.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedQueueOrders.map((group) => (
                                    <div key={group.id} className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                                    {group.name}
                                                </h3>
                                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0 bg-muted/50">
                                                    {group.orders.length}
                                                </Badge>
                                            </div>
                                            {group.id !== 'unknown' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-6 text-[9px] gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2"
                                                    onClick={() => router.push(`/dashboard/projects/${group.id}`)}
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Ir al Proyecto
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-3 pl-3 border-l-2 border-muted/30 ml-1.5">
                                            {group.orders.map((order: any) => {
                                                const typeCfg = ORDER_TYPE_LABELS[order.type] || { icon: Activity, label: order.type }
                                                return (
                                                    <div key={order.id} className="group relative overflow-hidden p-3 border rounded-xl bg-card hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-indigo-100 transition-colors">
                                                                    <typeCfg.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-600" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-xs leading-tight truncate max-w-[150px]">
                                                                        {order.orderName}
                                                                    </span>
                                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground/70 mt-0.5">
                                                                        {typeCfg.label}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="h-4 px-1 rounded-sm border-none bg-muted/30 text-[9px]">
                                                                {order.quantity} un.
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
