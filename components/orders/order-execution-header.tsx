"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    ArrowLeft, 
    Play, 
    Pause, 
    RotateCcw, 
    CheckCircle,
    Ban,
    Info, 
    Globe, 
    CalendarDays, 
    BarChart3,
    MessageSquare,
    Share2,
    Heart,
    UserPlus,
    AlertTriangle,
    Activity,
    Hash,
    Target,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { 
    startOrder, 
    pauseOrder, 
    resumeOrder, 
    retryOrder, 
    completeOrder,
    cancelOrder
} from "@/lib/actions/orders"
import { DownloadPDFButton } from "./download-pdf-button"
import { EditOrderButton } from "./edit-order-button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const TYPE_CONFIG: any = {
    COMENTARIO: { label: "Comentarios", icon: MessageSquare, color: "text-blue-600" },
    MEGUSTA: { label: "Me gusta", icon: Heart, color: "text-rose-600" },
    COMPARTIR: { label: "Compartidos", icon: Share2, color: "text-green-600" },
    SEGUIMIENTO: { label: "Seguidores", icon: UserPlus, color: "text-indigo-600" },
    REPORTE: { label: "Reportes", icon: AlertTriangle, color: "text-amber-600" },
}

interface OrderExecutionHeaderProps {
    order: any
    generatedCount: number
    publishedCount: number
}

export function OrderExecutionHeader({ order, generatedCount, publishedCount }: OrderExecutionHeaderProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const config = TYPE_CONFIG[order.type] || { label: "Ejecución", icon: Activity, color: "text-primary" }

    const handleAction = async (actionFn: (id: string) => Promise<any>, actionName: string) => {
        setActionLoading(actionName)
        startTransition(async () => {
            const result = await actionFn(order.id)
            if (result.success) {
                toast.success(`Acción ${actionName} completada`)
                router.refresh()
            } else {
                toast.error(result.error || `Error al ${actionName}`)
            }
            setActionLoading(null)
        })
    }

    const progress = Math.round(generatedCount > 0 ? (publishedCount / (generatedCount || 1)) * 100 : 0)

    return (
        <div className="flex flex-col gap-2 pt-1 pb-0 px-1">
            {/* Top Row: Meta & Info */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <config.icon className={`h-5 w-5 ${config.color}`} />
                                {order.orderName || `Orden #${order.id}`}
                            </h1>
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 opacity-40">#{order.id}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                <Globe className="h-3 w-3" />
                                {order.socialNetwork} · {order.postType}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                <CalendarDays className="h-3 w-3" />
                                {formatDateTime(order.createdAt)}
                            </div>
                            <Badge className="text-[10px] font-black h-5 px-2 uppercase tracking-tighter">
                                {order.status === 'GENERADA' ? 'EN OPERACIÓN' : order.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 font-black text-[11px] shadow-sm uppercase tracking-wider">
                                <Info className="h-4 w-4 text-primary" />
                                Ver Detalles
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    Detalles Técnicos
                                </DialogTitle>
                                <DialogDescription>
                                    Información completa de la orden.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Enlace Original</h4>
                                    <p className="text-sm font-medium break-all text-blue-600 underline">
                                        <a href={order.url} target="_blank" rel="noopener noreferrer">{order.url}</a>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Intención (Prompt)</h4>
                                    <div className="bg-muted p-3 rounded-md border text-sm italic text-muted-foreground leading-relaxed font-medium">
                                        "{order.intent || "Sin intención específica"}"
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Postura</h4>
                                        <Badge className={`font-bold ${order.project?.stance === 'AGAINST' ? 'bg-red-500/10 text-red-600 border-red-200' : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'}`}>
                                            {order.project?.stance === 'AGAINST' ? 'EN CONTRA' : 'A FAVOR'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Objetivo</h4>
                                        <p className="text-sm font-bold">{order.project?.target?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <DownloadPDFButton orderId={order.id} orderName={order.orderName ?? undefined} />
                </div>
            </div>

            {/* Bottom Row: Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-1.5 border-y border-border/40 px-2 bg-muted/5">
                <div className="flex-1 flex items-center justify-start gap-10">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                                <BarChart3 className="h-3 w-3" /> Logrados
                            </span>
                            <span className="text-lg font-black text-primary leading-tight">{publishedCount}</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                                <Activity className="h-3 w-3" /> Generados
                            </span>
                            <span className="text-lg font-black leading-tight">{generatedCount}</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                                <Hash className="h-3 w-3" /> Meta
                            </span>
                            <span className="text-lg font-black leading-tight">{order.quantity}</span>
                        </div>
                    </div>
                    
                    <div className="hidden lg:flex flex-col min-w-[200px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Target className="h-3 w-3" /> Progreso
                            </span>
                            <span className="text-[10px] font-black">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-700" 
                                style={{ width: `${Math.min(100, progress)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {order.status === 'LISTA' || order.status === 'PAUSADA' || order.status === 'CANCELADA' || order.status === 'REINTENTAR' || order.status === 'COMPLETADA' ? (
                        <Button 
                            size="sm" 
                            className="h-9 gap-2 font-black text-[11px] bg-emerald-600 hover:bg-emerald-700 shadow-sm uppercase tracking-wider"
                            disabled={actionLoading !== null}
                            onClick={() => handleAction(startOrder, 'iniciar')}
                        >
                            {actionLoading === 'iniciar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                            Iniciar
                        </Button>
                    ) : order.status === 'GENERADA' || order.status === 'GENERANDO' ? (
                        <Button 
                            size="sm" 
                            variant="secondary"
                            className="h-9 gap-2 font-black text-[11px] shadow-sm uppercase tracking-wider"
                            disabled={actionLoading !== null}
                            onClick={() => handleAction(pauseOrder, 'pausar')}
                        >
                            {actionLoading === 'pausar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4 fill-current" />}
                            Pausar
                        </Button>
                    ) : null}

                    {order.status !== 'COMPLETADA' && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="h-9 gap-2 font-black text-[11px] border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm uppercase tracking-wider"
                            disabled={actionLoading !== null}
                            onClick={() => handleAction(completeOrder, 'completar')}
                        >
                            {actionLoading === 'completar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Completar
                        </Button>
                    )}

                    {order.status !== 'CANCELADA' && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="h-9 gap-2 font-black text-[11px] border-red-200 text-red-700 hover:bg-red-50 shadow-sm uppercase tracking-wider"
                            disabled={actionLoading !== null}
                            onClick={() => handleAction(cancelOrder, 'cancelar')}
                        >
                            {actionLoading === 'cancelar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                            Cancelar
                        </Button>
                    )}

                    {order.status === 'REINTENTAR' && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="h-9 gap-2 font-black text-[11px] border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm uppercase tracking-wider"
                            disabled={actionLoading !== null}
                            onClick={() => handleAction(retryOrder, 'reintentar')}
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reintentar
                        </Button>
                    )}

                    <EditOrderButton order={order} />
                </div>
            </div>
        </div>
    )
}
