"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { MoreHorizontal, Ban, ExternalLink, MessageSquare, Play, Eye, Heart, Share2, UserPlus, FileText, CheckCircle2, Video, Image as ImageIcon, Type, Activity, Radio, Pause, Copy, Facebook, Instagram, ListChecks, Hash, RefreshCw, Undo, ShoppingBag } from "lucide-react"
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
    genMarketplaces?: { 
        status: string; 
        title: string; 
        price: number; 
        category: string; 
        condition?: string; 
        location?: string; 
        description: string; 
        images: string[] 
    }[]
}

const ORDER_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
    COMENTARIO: { label: "Comentarios", icon: MessageSquare, color: "text-muted-foreground bg-muted" },
    MEGUSTA: { label: "Me gusta", icon: Heart, color: "text-muted-foreground bg-muted" },
    COMPARTIR: { label: "Compartidos", icon: Share2, color: "text-muted-foreground bg-muted" },
    SEGUIMIENTO: { label: "Seguidores", icon: UserPlus, color: "text-muted-foreground bg-muted" },
    REPORTE: { label: "Reportes", icon: FileText, color: "text-muted-foreground bg-muted" },
    GENLIVE: { label: "En Vivo", icon: Activity, color: "text-muted-foreground bg-muted" },
    MARKETPLACE: { label: "Marketplace", icon: ShoppingBag, color: "text-muted-foreground bg-muted" },
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


    const stats = activeOrders.reduce((acc: any, order: any) => {
        const subItems = order.type === "COMENTARIO" ? order.genComments :
            order.type === "MEGUSTA" ? order.genLikes :
                order.type === "COMPARTIR" ? order.genShares :
                    order.type === "SEGUIMIENTO" ? order.genFollows :
                        order.type === "GENLIVE" ? order.genLives :
                            order.type === "MARKETPLACE" ? order.genMarketplaces :
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order: any) => {
                    const statusInfo = STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" as const }
                    const typeInfo = ORDER_TYPE_LABELS[order.type] || { label: order.type, icon: Play, color: "text-muted-foreground bg-muted" }
                    const isStarting = startingId === order.id
                    const isCompleted = order.status === "GENERADA"

                    const subItems = order.type === "COMENTARIO" ? order.genComments :
                        order.type === "MEGUSTA" ? order.genLikes :
                            order.type === "COMPARTIR" ? order.genShares :
                                order.type === "SEGUIMIENTO" ? order.genFollows :
                                    order.type === "GENLIVE" ? order.genLives :
                                        order.type === "MARKETPLACE" ? order.genMarketplaces :
                                            order.genReports

                    const publishedCount = subItems?.filter((i: any) => i.status === "PUBLICADO").length || 0;
                    const generatedCount = subItems?.filter((i: any) => i.status === "PUBLICADO" || i.status === "SINPUBLICAR").length || 0;
                    const publishedLabel = 'EJECUTADOS';
                    const isProcessing = order.status === "GENERANDO" || (order.status === "GENERADA" && publishedCount > 0)

                    const isCompletedStatus = order.status === "COMPLETADA"
                    const isGenerated = order.status === "GENERADA"
                    const isCancelled = order.status === "CANCELADA"
                    const isLiveOrder = order.type === "GENLIVE" || order.postType === "LIVE"

                    return (
                        <Card
                            key={order.id}
                            className={`overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full border relative
                                ${isCancelled 
                                    ? 'opacity-60 hover:opacity-100 border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 dark:bg-red-950/10 dark:border-red-500/20 transition-all duration-300' 
                                    : isLiveOrder && !isCompletedStatus
                                        ? 'animate-glow-pulse border-red-500/50 bg-red-50/10 dark:bg-red-950/20 shadow-lg shadow-red-500/20 border-l-4 border-l-red-500'
                                        : isCompletedStatus
                                            ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/30 dark:border-emerald-500/20'
                                        : isProcessing
                                                ? 'animate-glow-pulse border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                                                : ''}`}
                            {...({} as any)}
                        >
                            {(isProcessing || isLiveOrder) && !isCancelled && !isCompletedStatus && (
                                <div className="absolute inset-x-0 top-0 h-[2px] pointer-events-none overflow-hidden z-20">
                                    <div 
                                        className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-${isLiveOrder ? 'red-500' : 'indigo-500'} to-transparent -translate-x-full animate-shimmer-flash opacity-80`} 
                                    />
                                </div>
                            )}
                            
                            {(isProcessing || isLiveOrder) && !isCancelled && !isCompletedStatus && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10">
                                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${isLiveOrder ? 'red-500/10' : 'white/30 dark:white/5'} to-transparent w-[30%] -skew-x-[30deg] animate-shimmer-flash`} />
                                </div>
                            )}

                             
                            <CardHeader className={`flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 min-h-[80px] px-5 ${isCancelled ? 'bg-red-50/20 dark:bg-red-950/20' : (isCompletedStatus && !isLiveOrder ? 'bg-emerald-50/20 dark:bg-emerald-950/20' : isLiveOrder ? 'bg-red-50/20 dark:bg-red-950/20' : isProcessing ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : 'bg-muted/10')}`}>
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg transition-all duration-500 shadow-sm border ${isCancelled ? 'bg-red-500/10 text-red-600 border-red-500/20' : (isCompletedStatus && !isLiveOrder ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : isLiveOrder ? 'bg-red-500/20 text-red-600 border-red-500/30 animate-pulse' : typeInfo.color + ' border-current/10')}`}>
                                            {isCancelled ? <Ban className="h-4 w-4" /> : (isCompletedStatus && !isLiveOrder ? <CheckCircle2 className="h-4 w-4" /> : <typeInfo.icon className="h-4 w-4" />)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                             <div className="flex items-center gap-2">
                                                 <CardTitle className={`text-md font-bold truncate transition-colors ${isCancelled ? 'text-red-700/60' : (isCompletedStatus ? 'text-emerald-700' : isLiveOrder ? 'text-red-700' : isProcessing ? 'text-indigo-700' : '')}`}>
                                                     {order.orderName}
                                                 </CardTitle>
                                                 {isLiveOrder && !isCancelled && !isCompletedStatus && (
                                                     <div className="flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full ring-1 ring-red-500/30 animate-pulse ml-0.5">
                                                         <span className="relative flex h-2 w-2">
                                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                             <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                                         </span>
                                                         <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">Live</span>
                                                     </div>
                                                 )}
                                             </div>
                                             <div className="flex items-center gap-2">
                                                  <span className="text-[10px] font-mono text-muted-foreground/40 font-medium tracking-tight uppercase">ID: {order.id.slice(-8)}</span>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground/30 hover:text-indigo-600 bg-transparent hover:bg-indigo-50 border border-transparent hover:border-indigo-100/50 transition-all duration-300 hover:scale-110 hover:shadow-sm hover:shadow-indigo-500/20 group/eye"
                                                    onClick={() => setViewingOrder(order)}
                                                >
                                                    <Eye className="h-3.5 w-3.5 transition-transform duration-300 group-hover/eye:scale-110" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Ver detalles</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex">
                                                    <DownloadPDFButton orderId={order.id} orderName={order.orderName} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>Descargar PDF</TooltipContent>
                                        </Tooltip>

                                        <DropdownMenu>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>Más opciones</TooltipContent>
                                            </Tooltip>
                                            <DropdownMenuContent align="end" {...({} as any)}>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => setViewingOrder(order)} {...({} as any)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(order.url, '_blank', 'noopener,noreferrer')} {...({} as any)}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                {order.type === 'MARKETPLACE' ? 'Ver Marketplace' : 'Ver publicación'}
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
                                    </TooltipProvider>
                                </div>
                            </CardHeader>
                            {/* Balanced Metadata Grid (2x2) */}
                            <div className="grid grid-cols-2 gap-4 px-6 py-4 bg-secondary/5 border-y border-muted/10">
                                {/* Row 1, Col 1: Action Type */}
                                <div className="flex flex-col gap-1.5 pr-2">
                                    <span className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-tighter leading-none">Tipo Acción</span>
                                    <div className="flex items-center gap-2 text-foreground/70 font-bold uppercase text-[10px] tracking-tight leading-none">
                                        {(() => {
                                            const typeKey = order.type as string;
                                            const config = ORDER_TYPE_LABELS[typeKey] || { icon: MoreHorizontal, label: typeKey };
                                            const icon = config.icon;
                                            return (
                                                <>
                                                    {React.createElement(icon, { className: "h-3 w-3 opacity-50 text-indigo-500" })}
                                                    <span>{config.label}</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                {/* Row 1, Col 2: Origin (Network + Type) */}
                                <div className="flex flex-col gap-1.5 pl-2 border-l border-muted/10">
                                    <span className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-tighter leading-none text-right">Origen</span>
                                    <div className="flex items-center justify-end gap-2">
                                        <Badge variant="secondary" className={`text-[9px] font-black h-5 rounded-md px-2 border-none ring-1 ring-inset shadow-sm w-fit ${NETWORK_COLORS[order.socialNetwork].replace('text-', 'text-').replace('border-', 'ring-')}`}>
                                            {order.socialNetwork === "FACEBOOK" && <Facebook className="h-3 w-3 mr-1" />}
                                            {order.socialNetwork === "INSTAGRAM" && <Instagram className="h-3 w-3 mr-1" />}
                                            {order.socialNetwork === "TIKTOK" && <TikTokIcon className="h-3 w-3 mr-1" />}
                                            <span className="uppercase">{NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}</span>
                                        </Badge>
                                        {order.postType !== "OTRO" && (
                                            <div className="flex items-center gap-1.5 text-muted-foreground/60 font-bold uppercase text-[9px] tracking-tight leading-none bg-muted/30 px-1.5 py-0.5 rounded leading-none">
                                                {(() => {
                                                    const pType = POST_TYPE_LABELS[order.postType as PostType] || POST_TYPE_LABELS.OTRO
                                                    return (
                                                        <>
                                                            <pType.icon className="h-2.5 w-2.5 opacity-40" />
                                                            <span>{pType.label}</span>
                                                        </>
                                                    )
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2, Col 1: Creation */}
                                <div className="flex flex-col gap-1.5 pr-2 pt-1">
                                    <span className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-tighter leading-none">Creación</span>
                                    <div className="flex items-center gap-1.5 text-foreground/60 font-bold text-[10px] tabular-nums">
                                        <Hash className="h-2.5 w-2.5 opacity-30" />
                                        <span>{new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Row 2, Col 2: Access */}
                                <div className="flex flex-col items-end gap-1.5 pl-2 pt-1 border-l border-muted/10">
                                    <span className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-tighter leading-none">Acceso</span>
                                    <a 
                                        href={order.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 leading-none group transition-colors"
                                    >
                                        VER PUBLICACIÓN
                                        <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                            <CardContent className={`pt-2.5 space-y-4 flex-1 flex flex-col justify-between ${isLiveOrder && !isCompletedStatus ? 'bg-red-500/[0.02]' : ''}`} {...({} as any)}>
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
                                            <Badge variant="secondary" className={`${isCompletedStatus ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : order.status === "PAUSADA" ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : isProcessing ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30 animate-pulse' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'} text-[10px] font-bold h-6 px-2`}>
                                                {isCompletedStatus ? "Finalizada" : order.status === "PAUSADA" ? "Pausada" :
                                                    order.status === "GENERANDO" ? "Generando..." :
                                                    (isGenerated && publishedCount > 0) ? (
                                                        <span className="flex items-center gap-1">
                                                            <Activity className="h-3 w-3" />
                                                            {order.type === 'COMENTARIO' ? "Comentando..." : "En Operación"}
                                                        </span>
                                                    ) : "En Operación"}
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
                                         <span className="text-[10px] text-muted-foreground font-bold uppercase">
                                            {viewingOrder.type === 'MARKETPLACE' ? 'Enlace de Marketplace' : 'URL del Contenido'}
                                        </span>
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
 
                                 {viewingOrder.type === 'MARKETPLACE' && viewingOrder.genMarketplaces && viewingOrder.genMarketplaces[0] && (
                                     <div className="col-span-1 md:col-span-2 space-y-4 border-t pt-4">
                                         <span className="text-[10px] text-muted-foreground font-bold uppercase">Detalles del Producto (Marketplace)</span>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                                             <div className="space-y-1">
                                                 <span className="text-[10px] text-muted-foreground uppercase font-medium">Título</span>
                                                 <p className="text-sm font-bold">{viewingOrder.genMarketplaces[0].title}</p>
                                             </div>
                                             <div className="space-y-1">
                                                 <span className="text-[10px] text-muted-foreground uppercase font-medium">Precio</span>
                                                 <p className="text-sm font-bold text-primary">${viewingOrder.genMarketplaces[0].price}</p>
                                             </div>
                                             <div className="space-y-1">
                                                 <span className="text-[10px] text-muted-foreground uppercase font-medium">Categoría</span>
                                                 <p className="text-sm font-medium">{viewingOrder.genMarketplaces[0].category}</p>
                                             </div>
                                             <div className="space-y-1">
                                                 <span className="text-[10px] text-muted-foreground uppercase font-medium">Condición / Ubicación</span>
                                                 <p className="text-sm font-medium">{viewingOrder.genMarketplaces[0].condition || 'N/A'} • {viewingOrder.genMarketplaces[0].location || 'N/A'}</p>
                                             </div>
                                             <div className="col-span-1 md:col-span-2 space-y-1">
                                                 <span className="text-[10px] text-muted-foreground uppercase font-medium">Descripción</span>
                                                 <p className="text-xs text-muted-foreground leading-relaxed">{viewingOrder.genMarketplaces[0].description}</p>
                                             </div>
                                         </div>
                                     </div>
                                 )}
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
                                <ExternalLink className="mr-2 h-4 w-4" /> {viewingOrder.type === 'MARKETPLACE' ? 'Ir al Marketplace' : 'Ir a la Publicación'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
