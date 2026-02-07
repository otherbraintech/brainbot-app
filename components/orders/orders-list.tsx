"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, ExternalLink, MessageSquare, Play, Eye, Heart, Share2, UserPlus, FileText, Youtube, CheckCircle2, Video, Image as ImageIcon, Type, Activity, Radio, Pause, Copy, Facebook, Instagram } from "lucide-react"
import { TikTokIcon } from "@/components/icons/tiktok-icon"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { deleteOrder, startOrder, pauseOrder, resumeOrder, pauseAllOrders, resumeAllOrders, duplicateOrder } from "@/lib/actions/orders"
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
import { ListChecks } from "lucide-react"

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
        genLives: number
    }
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
    GENERADA: { label: "Generada", variant: "default" },
    CANCELADA: { label: "Cancelada", variant: "destructive" },
    REINTENTAR: { label: "Error / Reintentar", variant: "destructive" },
    COMPLETADA: { label: "Orden Completada", variant: "default" },
    PAUSADA: { label: "Pausada", variant: "outline" },
}

const NETWORK_LABELS: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    YOUTUBE: "YouTube",
}

const NETWORK_COLORS: Record<string, string> = {
    FACEBOOK: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50",
    INSTAGRAM: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200/50 dark:border-pink-900/50",
    TIKTOK: "bg-zinc-900 dark:bg-zinc-950 text-white border-zinc-800",
    YOUTUBE: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/50",
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

export function OrdersList({ orders, projectId }: { orders: Order[]; projectId: string }) {
    const router = useRouter()
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
    const [startingId, setStartingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleDelete() {
        if (!deletingOrder) return
        setLoading(true)
        setError(null)

        const result = await deleteOrder(deletingOrder.id)

        if (result.error) {
            setError(result.error)
        } else {
            setDeletingOrder(null)
        }
        setLoading(false)
    }

    async function handleStartOrder(orderId: string) {
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

    async function handlePauseOrder(orderId: string) {
        setLoading(true)
        await pauseOrder(orderId)
        setLoading(false)
    }

    async function handleResumeOrder(orderId: string) {
        setLoading(true)
        await resumeOrder(orderId)
        setLoading(false)
    }

    async function handlePauseAll() {
        if (!confirm("¿Estás seguro de que quieres pausar todas las órdenes en cola?")) return
        setLoading(true)
        await pauseAllOrders(projectId)
        setLoading(false)
    }

    async function handleResumeAll() {
        setLoading(true)
        await resumeAllOrders(projectId)
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

    const activeOrders = (orders as any).filter((o: any) => o.status !== "COMPLETADA" || (o.status === "COMPLETADA" && (o.type === 'GENLIVE' || o.postType === 'LIVE')))
    const queueOrders = (orders as any).filter((o: any) => o.status === "GENERADA")
    const pausedOrders = (orders as any).filter((o: any) => o.status === "PAUSADA")

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
            <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
                {queueOrders.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all font-bold text-xs uppercase"
                        onClick={handlePauseAll}
                        disabled={loading}
                    >
                        <Pause className="h-3.5 w-3.5" />
                        Pausar todo
                    </Button>
                )}

                {pausedOrders.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all font-bold text-xs uppercase"
                        onClick={handleResumeAll}
                        disabled={loading}
                    >
                        <Play className="h-3.5 w-3.5" />
                        Reanudar todo
                    </Button>
                )}

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
                                    Listo para Procesar (GENERADAS)
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        <ScrollArea className="flex-1 p-6" {...({} as any)}>
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
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                                                                {typeCfg.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className={`text-[10px] h-5 border-none px-2 shrink-0 flex items-center gap-1.5 ${NETWORK_COLORS[order.socialNetwork]}`}>
                                                        {order.socialNetwork === "FACEBOOK" && <Facebook className="h-3 w-3" />}
                                                        {order.socialNetwork === "INSTAGRAM" && <Instagram className="h-3 w-3" />}
                                                        {order.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3 w-3" />}
                                                        {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] font-medium pt-3 border-t border-dashed">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <span className="font-bold text-foreground">{order.quantity}</span>
                                                        <span>solicitados</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tight hover:bg-indigo-100/50 hover:text-indigo-700 underline-offset-4 hover:underline" asChild>
                                                        <Link href={`/dashboard/orders/${order.id}/executions`}>
                                                            Detalles <ExternalLink className="ml-1 h-3 w-3" />
                                                        </Link>
                                                    </Button>
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order: any) => {
                    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" as const }
                    const typeInfo = ORDER_TYPE_LABELS[order.type] || { label: order.type, icon: Play, color: "text-muted-foreground bg-muted" }
                    const isStarting = startingId === order.id
                    const isProcessing = order.status === "GENERANDO"
                    const isCompleted = order.status === "GENERADA"

                    const currentCount = order.type === "COMENTARIO" ? order._count.genComments :
                        order.type === "MEGUSTA" ? order._count.genLikes :
                            order.type === "COMPARTIR" ? order._count.genShares :
                                order.type === "SEGUIMIENTO" ? (order._count as any).genFollows :
                                    order.type === "GENLIVE" ? (order._count as any).genLives :
                                        (order._count as any).genReports

                    const isCompletedStatus = order.status === "COMPLETADA"
                    const isGenerated = order.status === "GENERADA"
                    const isLiveOrder = order.type === "GENLIVE" || order.postType === "LIVE"

                    return (
                        <Card
                            key={order.id}
                            className={`overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full border
                                ${isCompletedStatus && !isLiveOrder ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10' : ''} 
                                ${isLiveOrder ? 'border-red-500/30 ring-1 ring-red-500/10 shadow-lg shadow-red-500/10 scale-[1.01] bg-card' : ''}`}
                            {...({} as any)}
                        >
                            {isLiveOrder && order.status !== 'LISTA' && (
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
                            <CardHeader className={`flex flex-row items-center justify-between pb-2 min-h-[80px] ${isCompletedStatus && !isLiveOrder ? 'bg-green-50/40' : isLiveOrder ? 'bg-red-50/30' : 'bg-muted/20'}`} {...({} as any)}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md transition-all duration-500 ${isCompletedStatus && !isLiveOrder ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : isLiveOrder ? 'p-2 bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/30 scale-105' : typeInfo.color}`}>
                                            {isCompletedStatus && !isLiveOrder ? <CheckCircle2 className="h-4 w-4" /> : <typeInfo.icon className={`h-4 w-4 ${isLiveOrder && !isCompletedStatus ? 'h-5 w-5 animate-pulse' : 'h-5 w-5'}`} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <CardTitle className={`text-md font-bold truncate max-w-[150px] transition-colors ${isCompletedStatus ? 'text-emerald-700 dark:text-emerald-300' : isLiveOrder ? 'text-red-700 dark:text-red-400 font-black' : ''}`}>
                                                {order.orderName}
                                            </CardTitle>
                                            {isCompletedStatus && (
                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Orden Completada</span>
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
                                        <span>{new Date(order.createdAt).toLocaleDateString("es")}</span>
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
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => setDeletingOrder(order)}
                                                {...({} as any)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
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
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase block">Realizados</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xl font-bold text-primary">{currentCount}</span>
                                            <span className="text-xs text-muted-foreground">exitosos</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div></div>

                                    <div className="flex gap-2 items-center">
                                        {(isGenerated || isCompletedStatus || order.status === "PAUSADA") && (
                                            <Badge variant="secondary" className={`${isCompletedStatus ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : order.status === "PAUSADA" ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'} text-[10px] font-bold h-6 px-2`}>
                                                {isCompletedStatus ? "Finalizada" : order.status === "PAUSADA" ? "Pausada" :
                                                    (order.type === 'COMENTARIO' && currentCount > 0) ? "Comentando" : "En cola"}
                                            </Badge>
                                        )}

                                        {!isGenerated && !isCompletedStatus && !isProcessing && order.status !== "PAUSADA" && (
                                            <EditOrderButton order={order as any} />
                                        )}

                                        {isGenerated && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold px-4 border-amber-200 text-amber-700 hover:bg-amber-50"
                                                onClick={() => handlePauseOrder(order.id)}
                                                disabled={loading}
                                            >
                                                Pausar
                                            </Button>
                                        )}

                                        {order.status === "PAUSADA" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-bold px-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                onClick={() => handleResumeOrder(order.id)}
                                                disabled={loading}
                                            >
                                                Reanudar
                                            </Button>
                                        )}

                                        {(isGenerated || isCompletedStatus || order.status === "PAUSADA") ? (
                                            <Button variant="secondary" size="sm" className="h-8 text-xs font-bold px-4 border-slate-200 shadow-sm" asChild>
                                                <Link href={`/dashboard/orders/${order.id}/executions`}>
                                                    <Activity className="mr-1.5 h-3.5 w-3.5" /> Ver Ejecución
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs font-bold px-4"
                                                onClick={() => handleStartOrder(order.id)}
                                                disabled={isStarting || isProcessing}
                                            >
                                                {isStarting || isProcessing ? "En curso..." :
                                                    <><Play className="mr-1.5 h-3.5 w-3.5" /> Enviar orden</>}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán todos los registros asociados a esta orden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Details Modal */}
            <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Orden</DialogTitle>
                        <DialogDescription>Información completa de la solicitud</DialogDescription>
                    </DialogHeader>
                    {viewingOrder && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">Nombre:</span>
                                <span className="col-span-2 font-bold">{viewingOrder.orderName}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">Red Social:</span>
                                <span className="col-span-2">
                                    <Badge variant="outline" className={`h-5 flex items-center gap-1.5 ${NETWORK_COLORS[viewingOrder.socialNetwork]}`}>
                                        {viewingOrder.socialNetwork === "FACEBOOK" && <Facebook className="h-3 w-3" />}
                                        {viewingOrder.socialNetwork === "INSTAGRAM" && <Instagram className="h-3 w-3" />}
                                        {viewingOrder.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3 w-3" />}
                                        {NETWORK_LABELS[viewingOrder.socialNetwork]}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">Tipo:</span>
                                <span className="col-span-2 flex items-center gap-2">
                                    {(() => {
                                        const typeCfg = ORDER_TYPE_LABELS[viewingOrder.type] || { icon: Activity, label: viewingOrder.type }
                                        const Icon = typeCfg.icon
                                        return (
                                            <>
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                {typeCfg.label}
                                            </>
                                        )
                                    })()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">Cantidad:</span>
                                <span className="col-span-2 font-bold text-primary">{viewingOrder.quantity} unidades</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">Estado:</span>
                                <span className="col-span-2">
                                    <Badge variant={STATUS_LABELS[viewingOrder.status]?.variant || "outline"}>
                                        {STATUS_LABELS[viewingOrder.status]?.label || viewingOrder.status}
                                    </Badge>
                                </span>
                            </div>
                            <div className="grid gap-1.5 text-sm border-b pb-2">
                                <span className="text-muted-foreground font-medium">URL de la publicación:</span>
                                <a
                                    href={viewingOrder.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> {viewingOrder.url}
                                </a>
                            </div>
                            {viewingOrder.intent && (
                                <div className="grid gap-1.5 text-sm bg-muted/30 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                                    <span className="text-muted-foreground font-bold uppercase text-[10px]">Intención / Contexto:</span>
                                    <p className="italic leading-relaxed whitespace-pre-wrap">
                                        {viewingOrder.intent}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setViewingOrder(null)}>Cerrar</Button>
                        {viewingOrder && (
                            <Button
                                onClick={() => window.open(viewingOrder.url, '_blank')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" /> Ver Publicación
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
