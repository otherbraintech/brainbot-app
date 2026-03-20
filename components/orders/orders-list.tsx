"use client"

import { useState } from "react"
import { MoreHorizontal, Ban, ExternalLink, MessageSquare, Play, Eye, Heart, Share2, UserPlus, FileText, CheckCircle2, Video, Image as ImageIcon, Type, Activity, Radio, Pause, Copy, Facebook, Instagram, ListChecks, Hash, RefreshCw, Undo } from "lucide-react"
import { TikTokIcon } from "@/components/icons/tiktok-icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DownloadPDFButton } from "@/components/orders/download-pdf-button"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatDate, formatDateTime } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { startOrder, pauseOrder, resumeOrder, duplicateOrder, completeOrder, retryOrder, pauseAllGlobalOrders, cancelOrder, reopenOrder } from "@/lib/actions/orders"
import { EditOrderButton } from "@/components/orders/edit-order-button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

type Order = {
    id: string
    url: string
    orderName: string
    type: string
    socialNetwork: string
    postType: string
    intent: string | null
    quantity: number
    status: string
    createdAt: Date
    _count: {
        genComments: number
        genLikes: number
        genShares: number
        genFollows: number
        genLives: number
        genReports: number
    }
    genComments?: { status: string }[]
    genLikes?: { status: string }[]
    genShares?: { status: string }[]
    genFollows?: { status: string }[]
    genLives?: { status: string }[]
    genReports?: { status: string }[]
}

const ORDER_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    COMENTARIO: { label: "Comentarios", icon: MessageSquare, color: "text-muted-foreground bg-muted" },
    MEGUSTA: { label: "Me gusta", icon: Heart, color: "text-muted-foreground bg-muted" },
    COMPARTIR: { label: "Compartidos", icon: Share2, color: "text-muted-foreground bg-muted" },
    SEGUIMIENTO: { label: "Seguidores", icon: UserPlus, color: "text-muted-foreground bg-muted" },
    REPORTE: { label: "Reportes", icon: FileText, color: "text-muted-foreground bg-muted" },
    GENLIVE: { label: "En Vivo", icon: Activity, color: "text-muted-foreground bg-muted" },
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    LISTA: { label: "Listo para iniciar", variant: "outline" },
    GENERANDO: { label: "En proceso...", variant: "secondary" },
    GENERADA: { label: "En Operación", variant: "default" },
    CANCELADA: { label: "Cancelada", variant: "destructive" },
    REINTENTAR: { label: "Error / Reintentar", variant: "destructive" },
    COMPLETADA: { label: "Orden Completada", variant: "default" },
    PAUSADA: { label: "Pausada", variant: "outline" },
}

const NETWORK_LABELS: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
}

const NETWORK_COLORS: Record<string, string> = {
    FACEBOOK: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50",
    INSTAGRAM: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/50",
    TIKTOK: "bg-zinc-900 dark:bg-zinc-950 text-white border-zinc-800",
}

type PostType = "VIDEO" | "IMAGEN" | "TEXTO" | "LIVE" | "OTRO" | "PAGINA" | "PUBLICACION";

const POST_TYPE_LABELS: Record<PostType, { label: string; icon: any }> = {
    VIDEO: { label: "Video", icon: Video },
    IMAGEN: { label: "Imagen", icon: ImageIcon },
    TEXTO: { label: "Texto", icon: Type },
    LIVE: { label: "Live", icon: Radio },
    OTRO: { label: "Otro", icon: MoreHorizontal },
    PAGINA: { label: "Página", icon: FileText },
    PUBLICACION: { label: "Publicación", icon: FileText },
}

export function OrdersList({ orders, projectId, globalQueue }: { orders: Order[]; projectId: string; globalQueue?: Order[] }) {
    const router = useRouter()
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
    const [startingId, setStartingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<{ id: string, name: string, type: 'pausar' | 'reanudar' | 'finalizar' | 'reabrir' } | null>(null)
    const [activateWithPause, setActivateWithPause] = useState<{ id: string, name: string, action: 'reanudar' | 'enviar' } | null>(null)

    async function handleCancel() {
        if (!deletingOrder) return
        setLoading(true)
        setError(null)

        const result = await cancelOrder(deletingOrder.id)

        if ((result as any).error) {
            setError((result as any).error)
        } else {
            setDeletingOrder(null)
        }
        setLoading(false)
    }

    async function handleStartOrder(orderId: string) {
        // Check if there are other active orders globally
        const activeGlobal = (queueOrders as any[]).filter((o: any) => o.status === "GENERADA" && o.id !== orderId)
        if (activeGlobal.length > 0) {
            const orderData = (orders as any[]).find((o: any) => o.id === orderId) || (queueOrders as any[]).find((o: any) => o.id === orderId)
            setActivateWithPause({ id: orderId, name: orderData?.orderName || 'Orden', action: 'enviar' })
            return
        }
        await executeStartOrder(orderId)
    }

    async function executeStartOrder(orderId: string) {
        setStartingId(orderId)
        setError(null)
        const result = await startOrder(orderId)

        if ((result as any)?.code === "PROJECT_TARGET_REQUIRED" && (result as any)?.projectId) {
            setError((result as any)?.error || "Se necesita crear un objetivo para continuar.")
            router.push(`/dashboard/projects/${(result as any).projectId}?createTarget=1`)
            setStartingId(null)
            return
        }

        if ((result as any)?.error) setError((result as any).error)
        setStartingId(null)
    }

    async function handleRetryOrder(orderId: string) {
        setStartingId(orderId)
        setError(null)
        const result = await retryOrder(orderId)
        if ((result as any)?.error) setError((result as any).error)
        setStartingId(null)
    }

    async function handlePauseOrder(orderId: string) {
        setLoading(true)
        await pauseOrder(orderId)
        setLoading(false)
    }

    async function handleResumeOrder(orderId: string) {
        // Check if there are other active orders globally
        const activeGlobal = (queueOrders as any[]).filter((o: any) => o.status === "GENERADA" && o.id !== orderId)
        if (activeGlobal.length > 0) {
            const orderData = (orders as any[]).find((o: any) => o.id === orderId) || (queueOrders as any[]).find((o: any) => o.id === orderId)
            setActivateWithPause({ id: orderId, name: orderData?.orderName || 'Orden', action: 'reanudar' })
            return
        }
        setLoading(true)
        await resumeOrder(orderId)
        setLoading(false)
    }

    async function executeActivateWithPause() {
        if (!activateWithPause) return
        setLoading(true)
        // Pause all other active orders first
        await pauseAllGlobalOrders(activateWithPause.id)
        // Then activate the selected one
        if (activateWithPause.action === 'reanudar') {
            await resumeOrder(activateWithPause.id)
        } else {
            await startOrder(activateWithPause.id)
        }
        setActivateWithPause(null)
        setLoading(false)
    }

    async function handleDuplicate(order: Order) {
        setLoading(true)
        const result = await duplicateOrder(order.id)
        if ((result as any).error) {
            setError((result as any).error)
        }
        setLoading(false)
    }

    async function handleCompleteOrder(orderId: string) {
        setLoading(true)
        await completeOrder(orderId)
        setLoading(false)
    }

    async function executeConfirmAction() {
        if (!confirmAction) return
        if (confirmAction.type === 'reanudar') {
            // Route through handleResumeOrder to enforce single-active-order rule
            setConfirmAction(null)
            handleResumeOrder(confirmAction.id)
            return
        }
        setLoading(true)
        if (confirmAction.type === 'pausar') await pauseOrder(confirmAction.id)
        else if (confirmAction.type === 'finalizar') await completeOrder(confirmAction.id)
        else if (confirmAction.type === 'reabrir') await reopenOrder(confirmAction.id)
        setConfirmAction(null)
        setLoading(false)
    }

    const activeOrders = orders as any
    const queueOrders = globalQueue || (orders as any).filter((o: any) => o.status === "GENERADA")
    const pausedOrders = (orders as any).filter((o: any) => o.status === "PAUSADA")

    const stats = activeOrders.reduce((acc: any, order: any) => {
        const subItems = order.type === "COMENTARIO" ? order.genComments :
            order.type === "MEGUSTA" ? order.genLikes :
                order.type === "COMPARTIR" ? order.genShares :
                    order.type === "SEGUIMIENTO" ? order.genFollows :
                        order.type === "GENLIVE" ? order.genLives :
                            order.genReports;

        const published = subItems?.filter((i: any) => i.status === "PUBLICADO").length || 0;
        const generated = subItems?.filter((i: any) => i.status === "PUBLICADO" || i.status === "SINPUBLICAR").length || 0;

        acc.totalRequested += order.quantity;
        acc.totalCompleted += published;
        acc.totalGenerated += generated;
        acc[order.socialNetwork] = (acc[order.socialNetwork] || 0) + 1;
        return acc;
    }, { totalRequested: 0, totalCompleted: 0, totalGenerated: 0, FACEBOOK: 0, INSTAGRAM: 0, TIKTOK: 0 });

    if (activeOrders.length === 0 && queueOrders.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay órdenes</h3>
                    <p className="text-muted-foreground text-center mt-1">
                        Crea tu primera orden para comenzar a interactuar.
                        <br />
                        <Link href="/dashboard/orders/history" className="text-primary hover:underline text-xs mt-2 inline-block">Ver historial de completadas</Link>
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-6 mb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-indigo-500/5 border-indigo-500/10 dark:border-indigo-500/20 shadow-sm border overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ListChecks className="h-12 w-12 text-indigo-600" />
                        </div>
                        <CardContent className="p-4 flex flex-col items-start justify-center relative">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1 tracking-wider">Total Órdenes</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{activeOrders.length}</span>
                                <span className="text-[10px] text-indigo-600/60 font-medium">activas</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-500/5 border-blue-500/10 dark:border-blue-500/20 shadow-sm border overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Facebook className="h-12 w-12 text-blue-600" />
                        </div>
                        <CardContent className="p-4 flex flex-col items-start justify-center relative">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Facebook className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider">Facebook</span>
                            </div>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.FACEBOOK}</span>
                        </CardContent>
                    </Card>

                    <Card className="bg-pink-500/5 border-pink-500/10 dark:border-pink-500/20 shadow-sm border overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Instagram className="h-12 w-12 text-pink-600" />
                        </div>
                        <CardContent className="p-4 flex flex-col items-start justify-center relative">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Instagram className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
                                <span className="text-[10px] uppercase font-bold text-pink-700 dark:text-pink-300 tracking-wider">Instagram</span>
                            </div>
                            <span className="text-2xl font-black text-pink-600 dark:text-pink-400">{stats.INSTAGRAM}</span>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-500/5 border-zinc-500/10 dark:border-zinc-500/20 shadow-sm border overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <TikTokIcon className="h-12 w-12 text-zinc-600" />
                        </div>
                        <CardContent className="p-4 flex flex-col items-start justify-center relative">
                            <div className="flex items-center gap-1.5 mb-1">
                                <TikTokIcon className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                                <span className="text-[10px] uppercase font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">TikTok</span>
                            </div>
                            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stats.TIKTOK}</span>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Total Solicitados
                            </span>
                            <span className="text-lg font-bold">{stats.totalRequested}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Total Ejecutados
                            </span>
                            <span className="text-lg font-bold text-primary">{stats.totalCompleted} <span className="text-xs font-normal text-muted-foreground">de {stats.totalGenerated}</span></span>
                        </div>
                        <div className="hidden sm:flex h-8 w-[1px] bg-muted-foreground/20" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Progreso Global</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-primary">
                                    {stats.totalRequested > 0 ? Math.round((stats.totalCompleted / stats.totalRequested) * 100) : 0}%
                                </span>
                                <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden ring-1 ring-border">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500" 
                                        style={{ width: `${stats.totalRequested > 0 ? Math.min(100, (stats.totalCompleted / stats.totalRequested) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                <Sheet>
                    <SheetTrigger {...({ asChild: true } as any)}>
                        <Button variant="outline" className="gap-2 relative border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50">
                            <ListChecks className="h-4 w-4 text-indigo-600" />
                            <span className="font-bold text-xs uppercase tracking-tight">Ver Cola</span>
                            {queueOrders.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-indigo-600 ring-2 ring-white">
                                    {queueOrders.length}
                                </Badge>
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
                                    {globalQueue ? "Órdenes Activas Globales" : "Listo para Procesar (GENERADAS)"}
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        <ScrollArea className="flex-1 min-h-0 p-6" {...({} as any)}>
                            <div className="space-y-4 pr-1">
                                {queueOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                                        <Activity className="h-12 w-12 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No hay órdenes en cola actualmente.</p>
                                    </div>
                                ) : (
                                    queueOrders.map((order: any) => {
                                        const typeCfg = ORDER_TYPE_LABELS[order.type] || { icon: Activity, label: order.type }
                                        return (
                                            <div key={order.id} className="group relative overflow-hidden p-4 border rounded-xl bg-card hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-indigo-100 transition-colors">
                                                            <typeCfg.icon className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm leading-tight truncate max-w-[180px]">
                                                                {order.orderName}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                                                                    {typeCfg.label}
                                                                </span>
                                                                {order.project?.name && (
                                                                    <>
                                                                    <span className="text-[10px] text-muted-foreground/40">•</span>
                                                                    <span className="text-[10px] uppercase font-bold text-indigo-600/80 truncate max-w-[120px]">
                                                                        {order.project.name}
                                                                    </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                        <Badge variant="outline" className={`text-[10px] h-5 border-none px-2 flex items-center gap-1.5 ${NETWORK_COLORS[order.socialNetwork]}`}>
                                                            {order.socialNetwork === "FACEBOOK" && <Facebook className="h-3 w-3" />}
                                                            {order.socialNetwork === "INSTAGRAM" && <Instagram className="h-3 w-3" />}
                                                            {order.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3 w-3" />}
                                                            {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                                        </Badge>
                                                        <Badge variant="secondary" className={`text-[8px] h-3.5 px-1.5 py-0 uppercase ${
                                                            order.status === 'GENERADA' ? 'bg-blue-500/10 text-blue-700 border-blue-200' :
                                                            order.status === 'PAUSADA' ? 'bg-amber-500/10 text-amber-700 border-amber-200' :
                                                            order.status === 'GENERANDO' ? 'bg-violet-500/10 text-violet-700 border-violet-200' :
                                                            order.status === 'LISTA' ? 'bg-slate-500/10 text-slate-700 border-slate-200' :
                                                            order.status === 'REINTENTAR' ? 'bg-red-500/10 text-red-700 border-red-200' : ''
                                                        }`}>
                                                            {order.status === 'GENERADA' ? 'Activa' :
                                                             order.status === 'PAUSADA' ? 'Pausada' :
                                                             order.status === 'GENERANDO' ? 'Generando...' :
                                                             order.status === 'LISTA' ? 'Lista' :
                                                             order.status === 'REINTENTAR' ? 'Error' : order.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] font-medium pt-3 border-t border-dashed">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <span className="font-bold text-foreground">{order.quantity}</span>
                                                        <span>solicitados</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {order.status === 'GENERADA' && (
                                                            <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-bold uppercase border-amber-200 text-amber-600 hover:bg-amber-50 gap-1"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'pausar' })}
                                                                disabled={loading}
                                                            >
                                                                <Pause className="h-3 w-3" /> Pausar
                                                            </Button>
                                                        )}
                                                        {order.status === 'PAUSADA' && (
                                                            <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-bold uppercase border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1"
                                                                onClick={() => handleResumeOrder(order.id)}
                                                                disabled={loading}
                                                            >
                                                                <Play className="h-3 w-3" /> Reanudar
                                                            </Button>
                                                        )}
                                                        {order.status === 'LISTA' && (
                                                            <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-bold uppercase border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1"
                                                                onClick={() => handleStartOrder(order.id)}
                                                                disabled={loading || startingId === order.id}
                                                            >
                                                                <Play className="h-3 w-3" /> Enviar
                                                            </Button>
                                                        )}
                                                        {(order.status === 'GENERADA' || order.status === 'PAUSADA') && (
                                                            <Button variant="outline" size="sm" className="h-6 px-2 text-[9px] font-bold uppercase border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'finalizar' })}
                                                                disabled={loading}
                                                            >
                                                                <CheckCircle2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] font-bold uppercase tracking-tight hover:bg-indigo-100/50 hover:text-indigo-700" asChild>
                                                            <Link href={`/dashboard/orders/${order.id}/executions`}>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-muted/5 text-center">
                            <Link href="/dashboard/orders/history" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                Ver todo el historial completo →
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order: any) => {
                    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" as const }
                    const typeInfo = ORDER_TYPE_LABELS[order.type] || { label: order.type, icon: Play, color: "text-muted-foreground bg-muted" }
                    const isStarting = startingId === order.id
                    const isProcessing = order.status === "GENERANDO"
                    const isCompleted = order.status === "GENERADA"

                    const subItems = order.type === "COMENTARIO" ? order.genComments :
                        order.type === "MEGUSTA" ? order.genLikes :
                            order.type === "COMPARTIR" ? order.genShares :
                                order.type === "SEGUIMIENTO" ? order.genFollows :
                                    order.type === "GENLIVE" ? order.genLives :
                                        order.genReports

                    const publishedCount = subItems?.filter((i: any) => i.status === "PUBLICADO").length || 0;
                    const generatedCount = subItems?.filter((i: any) => i.status === "PUBLICADO" || i.status === "SINPUBLICAR").length || 0;
                    const publishedLabel = 'EJECUTADOS';

                    const isCompletedStatus = order.status === "COMPLETADA"
                    const isGenerated = order.status === "GENERADA"
                    const isCancelled = order.status === "CANCELADA"
                    const isLiveOrder = order.type === "GENLIVE" || order.postType === "LIVE"

                    return (
                        <Card
                            key={order.id}
                            className={`overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full border
                                ${isCancelled ? 'opacity-60 border-red-500/20 bg-red-500/5 dark:bg-red-950/20 dark:border-red-500/20' : ''}
                                ${isCompletedStatus && !isLiveOrder && !isCancelled ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/40 dark:border-emerald-500/30' : ''} 
                                ${isLiveOrder && !isCancelled ? 'border-red-500/30 ring-1 ring-red-500/10 shadow-lg shadow-red-500/10 scale-[1.01] bg-card' : ''}`}
                            {...({} as any)}
                        >

                            {isLiveOrder && !isCancelled && order.status !== 'LISTA' && (
                                <div className={`text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 flex items-center justify-center gap-2 shadow-sm ${isCompletedStatus ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'}`}>
                                    {isCompletedStatus ? (
                                        <>
                                            <CheckCircle2 className="h-3 w-3" />
                                            Live Finalizado
                                        </>
                                    ) : (
                                        <>
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                            </span>
                                            Prioridad: Live Activo
                                        </>
                                    )}
                                </div>
                            )}
                            <CardHeader className={`flex flex-row items-center justify-between pb-2 min-h-[80px] ${isCancelled ? 'bg-red-50/40 dark:bg-red-950/30' : (isCompletedStatus && !isLiveOrder ? 'bg-green-50/40 dark:bg-emerald-950/30' : isLiveOrder ? 'bg-red-50/30 dark:bg-red-950/20' : 'bg-muted/20')}`} {...({} as any)}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md transition-all duration-500 ${isCancelled ? 'bg-red-500/20 text-red-600 dark:text-red-400' : (isCompletedStatus && !isLiveOrder ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : isLiveOrder ? 'p-2 bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/30 scale-105' : typeInfo.color)}`}>
                                            {isCancelled ? <Ban className="h-4 w-4" /> : (isCompletedStatus && !isLiveOrder ? <CheckCircle2 className="h-4 w-4" /> : <typeInfo.icon className={`h-4 w-4 ${isLiveOrder && !isCompletedStatus ? 'h-5 w-5 animate-pulse' : 'h-5 w-5'}`} />)}
                                        </div>
                                        <div className="flex flex-col">
                                            <CardTitle className={`text-md font-bold truncate max-w-[150px] transition-colors ${isCancelled ? 'text-red-700 dark:text-red-400' : (isCompletedStatus ? 'text-emerald-700 dark:text-emerald-300' : isLiveOrder ? 'text-red-700 dark:text-red-400 font-black' : '')}`}>
                                                {order.orderName}
                                            </CardTitle>
                                            <span className="text-[10px] font-mono text-muted-foreground">ID: #{order.id}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{typeInfo.label}</span>
                                            {isCancelled ? (
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Orden Cancelada</span>
                                            ) : isCompletedStatus && (
                                                <span className="text-[10px] font-bold text-green-600 dark:text-emerald-400 uppercase tracking-wider">Orden Completada</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                                        <Badge variant="outline" className={`text-[11px] h-5 py-0 border-none px-2 flex items-center gap-1.5 ${NETWORK_COLORS[order.socialNetwork]}`}>
                                            {order.socialNetwork === "FACEBOOK" && <Facebook className="h-3 w-3" />}
                                            {order.socialNetwork === "INSTAGRAM" && <Instagram className="h-3 w-3" />}
                                            {order.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3 w-3" />}
                                            {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                        </Badge>
                                        {order.postType !== "OTRO" && (
                                            <>
                                                <span className="opacity-50">•</span>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 border border-secondary">
                                                    {(() => {
                                                        const pType = POST_TYPE_LABELS[order.postType as PostType] || POST_TYPE_LABELS.OTRO
                                                        return (
                                                            <>
                                                                <pType.icon className="h-3 w-3" />
                                                                <span className="text-[10px] font-medium uppercase tracking-wider">{pType.label}</span>
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            </>
                                        )}
                                        <span className="opacity-50">•</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-50"
                                        onClick={() => setViewingOrder(order)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <DownloadPDFButton orderId={order.id} orderName={order.orderName} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" {...({} as any)}>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => setViewingOrder(order)} {...({} as any)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(order.url, '_blank', 'noopener,noreferrer')} {...({} as any)}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Ver publicación
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleDuplicate(order)} {...({} as any)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicar orden
                                            </DropdownMenuItem>
                                             {!isCompletedStatus && order.status !== "CANCELADA" && (
                                                <DropdownMenuItem
                                                    className="text-red-600 cursor-pointer"
                                                    onClick={() => setDeletingOrder(order)}
                                                    {...({} as any)}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Cancelar orden
                                                </DropdownMenuItem>
                                             )}
                                             {order.status === "GENERADA" && (
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'pausar' })} {...({} as any)}>
                                                    <Pause className="mr-2 h-4 w-4" />
                                                    Pausar orden
                                                </DropdownMenuItem>
                                             )}
                                             {order.status === "PAUSADA" && (
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleResumeOrder(order.id)} {...({} as any)}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Reanudar orden
                                                </DropdownMenuItem>
                                             )}
                                             {(order.status === "GENERADA" || order.status === "PAUSADA") && (
                                                <DropdownMenuItem className="cursor-pointer text-emerald-600" onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'finalizar' })} {...({} as any)}>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Finalizar orden
                                                </DropdownMenuItem>
                                             )}
                                             {isCompletedStatus && (
                                                <DropdownMenuItem className="cursor-pointer text-orange-600" onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'reabrir' })} {...({} as any)}>
                                                    <Undo className="mr-2 h-4 w-4" />
                                                    Reabrir (Mover a Lista)
                                                </DropdownMenuItem>
                                             )}
                                             {(order.status === "LISTA" || order.status === "REINTENTAR") && (
                                                <DropdownMenuItem className="cursor-pointer text-emerald-600" onClick={() => handleStartOrder(order.id)} {...({} as any)}>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Enviar orden
                                                </DropdownMenuItem>
                                             )}
                                         </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            {order.intent && (order.type === "COMENTARIO" || isLiveOrder) && (
                                <div className="px-5 py-3 bg-muted/10 border-b border-muted/10">
                                    <div className="flex gap-2">
                                        <div className="min-w-[3px] rounded-full bg-muted-foreground/30" />
                                        <p className="text-xs text-muted-foreground italic line-clamp-3 leading-relaxed">
                                            {order.intent}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <CardContent className={`pt-2.5 space-y-4 flex-1 flex flex-col justify-between ${isLiveOrder ? 'bg-red-50/5' : ''}`} {...({} as any)}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1 text-sm">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Meta</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold">{order.quantity}</span>
                                            <span className="text-xs text-muted-foreground">solicitados</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">{publishedLabel}</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xl font-bold text-primary">{publishedCount}</span>
                                            <span className="text-xs text-muted-foreground">de {generatedCount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div></div>

                                    <div className="flex gap-1.5 items-center">
                                        {isCancelled && (
                                            <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-[10px] font-bold h-6 px-2">
                                                Cancelada
                                            </Badge>
                                        )}
                                        {!isCancelled && (isGenerated || isCompletedStatus || order.status === "PAUSADA") && (
                                            <Badge variant="secondary" className={`${isCompletedStatus ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : order.status === "PAUSADA" ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'} text-[10px] font-bold h-6 px-2`}>
                                                {isCompletedStatus ? "Finalizada" : order.status === "PAUSADA" ? "Pausada" :
                                                    (order.type === 'COMENTARIO' && publishedCount > 0) ? "Comentando" : "En Operación"}
                                            </Badge>
                                        )}

                                        {!isCancelled && !isGenerated && !isCompletedStatus && !isProcessing && order.status !== "PAUSADA" && (
                                            <EditOrderButton order={order as any} />
                                        )}

                                        {!isCancelled && (
                                        <TooltipProvider>
                                            <div className="flex items-center gap-1">
                                                {isGenerated && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-amber-200 text-amber-600 hover:bg-amber-50"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'pausar' })}
                                                                disabled={loading}
                                                            >
                                                                <Pause className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Pausar orden</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {order.status === "PAUSADA" && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'reanudar' })}
                                                                disabled={loading}
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Reanudar orden</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {(isGenerated || order.status === "PAUSADA") && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'finalizar' })}
                                                                disabled={loading}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Finalizar orden</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {isCompletedStatus && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                                                                onClick={() => setConfirmAction({ id: order.id, name: order.orderName, type: 'reabrir' })}
                                                                disabled={loading}
                                                            >
                                                                <Undo className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Desfinalizar orden</TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {(isGenerated || isCompletedStatus || order.status === "PAUSADA") ? (
                                                    <div className="flex items-center gap-1">
                                                        {generatedCount < order.quantity && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="icon" 
                                                                        className="h-8 w-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                                        onClick={() => handleRetryOrder(order.id)}
                                                                        disabled={isStarting}
                                                                    >
                                                                        {isStarting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Completar / Re-enviar faltantes</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="secondary" size="icon" className="h-8 w-8 border-slate-200 shadow-sm" asChild>
                                                                    <Link href={`/dashboard/orders/${order.id}/executions`}>
                                                                        <Activity className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Ver Ejecución</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-xs font-bold px-4"
                                                        onClick={() => handleStartOrder(order.id)}
                                                        disabled={isStarting || isProcessing}
                                                    >
                                                        {isStarting || isProcessing ? "..." :
                                                            <><Play className="mr-1.5 h-3.5 w-3.5" /> Enviar</>}
                                                    </Button>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Cancel Confirmation */}
            <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar orden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La orden <span className="font-bold text-foreground">"{deletingOrder?.orderName}"</span> será marcada como cancelada y detendrá cualquier proceso pendiente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? "Cancelando..." : "Cancelar orden"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* General Action Confirmation */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="capitalize">¿{confirmAction?.type} orden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que quieres {confirmAction?.type} la orden <span className="font-bold text-foreground">"{confirmAction?.name}"</span>?
                            {confirmAction?.type === 'finalizar' && " Esta acción marcará la orden como completada y detendrá cualquier proceso pendiente."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeConfirmAction}
                            className={confirmAction?.type === 'pausar' ? "bg-amber-600 hover:bg-amber-700" : confirmAction?.type === 'finalizar' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary"}
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : confirmAction?.type ? confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1) : "Confirmar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Activate with Pause Dialog */}
            <AlertDialog open={!!activateWithPause} onOpenChange={() => setActivateWithPause(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Pause className="h-5 w-5 text-amber-600" />
                            Pausar órdenes activas
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Solo puede haber <span className="font-bold text-foreground">una orden activa</span> a la vez. 
                            Al {activateWithPause?.action === 'reanudar' ? 'reanudar' : 'enviar'} la orden <span className="font-bold text-foreground">"{activateWithPause?.name}"</span>, 
                            se pausarán automáticamente las demás órdenes activas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                executeActivateWithPause()
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading}
                        >
                            {loading ? "Procesando..." : `Pausar las demás y ${activateWithPause?.action === 'reanudar' ? 'reanudar' : 'enviar'}`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Details Modal */}
            <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Detalles de la Orden</DialogTitle>
                        <DialogDescription>Información completa de la solicitud para control y seguimiento</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh] pr-4">
                        {viewingOrder && (
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Nombre de la Orden</span>
                                        <div className="flex flex-col">
                                            <p className="font-bold text-lg leading-tight">{viewingOrder.orderName}</p>
                                            <span className="text-[10px] font-mono text-muted-foreground">#{viewingOrder.id}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Red Social</span>
                                        <div className="pt-1">
                                            <Badge variant="outline" className={`h-6 flex items-center gap-2 w-fit px-3 ${NETWORK_COLORS[viewingOrder.socialNetwork]}`}>
                                                {viewingOrder.socialNetwork === "FACEBOOK" && <Facebook className="h-3.5 w-3.5" />}
                                                {viewingOrder.socialNetwork === "INSTAGRAM" && <Instagram className="h-3.5 w-3.5" />}
                                                {viewingOrder.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3.5 w-3.5" />}
                                                {NETWORK_LABELS[viewingOrder.socialNetwork]}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1 border-t pt-4 md:border-t-0 md:pt-0">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Tipo de Acción</span>
                                        <div className="flex items-center gap-2 pt-1">
                                            {(() => {
                                                const typeCfg = ORDER_TYPE_LABELS[viewingOrder.type] || { icon: Activity, label: viewingOrder.type }
                                                const Icon = typeCfg.icon
                                                return (
                                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-md border text-sm font-medium">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        {typeCfg.label}
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                    <div className="space-y-1 border-t pt-4 md:border-t-0 md:pt-0">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Meta Solicitada</span>
                                        <p className="text-lg font-bold text-primary pt-1">{viewingOrder.quantity} <span className="text-sm font-normal text-muted-foreground">unidades</span></p>
                                    </div>
                                    <div className="space-y-1 border-t pt-4">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Estado Actual</span>
                                        <div className="pt-1">
                                            <Badge 
                                                variant={STATUS_LABELS[viewingOrder.status]?.variant || "outline"}
                                                className="font-bold px-3 py-0.5"
                                            >
                                                {STATUS_LABELS[viewingOrder.status]?.label || viewingOrder.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1 border-t pt-4">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Fecha de Creación</span>
                                        <p className="text-sm font-medium pt-1">
                                            {formatDate(viewingOrder.createdAt)}
                                        </p>
                                    </div>
                                    
                                    <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-4">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">URL del Contenido</span>
                                        <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                            <a
                                                href={viewingOrder.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline break-all text-sm font-medium"
                                            >
                                                {viewingOrder.url}
                                            </a>
                                        </div>
                                    </div>

                                    {viewingOrder.intent && (
                                        <div className="col-span-1 md:col-span-2 space-y-2 border-t pt-4">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Intención / Contexto</span>
                                            <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                                                <p className="text-sm italic leading-relaxed whitespace-pre-wrap text-muted-foreground font-medium">
                                                    "{viewingOrder.intent}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                    <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                        <Button variant="ghost" onClick={() => setViewingOrder(null)} className="font-medium">
                            Cerrar
                        </Button>
                        {viewingOrder && (
                            <Button
                                onClick={() => window.open(viewingOrder.url, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-200 dark:shadow-none"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" /> Ir a la Publicación
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
