import { getOrderWithComments } from "@/lib/actions/orders"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Activity, UserPlus, Heart, Share2, AlertTriangle, MessageSquare, ExternalLink, Globe, Hash, Info, Layers, Target, CalendarDays, AlignLeft, BarChart3, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { CopyUrlButton } from "@/components/orders/copy-url-button"
import { EditableCommentRow } from "@/components/orders/editable-comment-row"
import { InteractionTableClient } from "@/components/orders/interaction-table-client"

export default async function OrderCommentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { order, error } = await getOrderWithComments(id)

    if (error || !order) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/projects/${order.projectId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{order.orderName || "Comentarios Generados"}</h1>
                    <p className="text-muted-foreground text-sm">
                        {order.project.name} · Verificando comentarios generados para esta orden
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-border bg-card">
                <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Información de la Orden</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-background">
                            {order.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Enlace de la Publicación
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted/20 border rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate" title={order.url}>
                                    {order.url}
                                </div>
                                <div className="flex shrink-0 gap-1.5">
                                    <CopyUrlButton url={order.url} />
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" asChild title="Abrir enlace">
                                        <a href={order.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                             <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                    <Target className="h-3 w-3" /> Postura del Proyecto
                                </span>
                                <div className="flex flex-col mt-0.5 items-start">
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            order.project.stance === 'AGAINST' 
                                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50' 
                                                : order.project.stance === 'FAVOR' 
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' 
                                                : ''
                                        }
                                    >
                                        {order.project.stance === 'AGAINST' ? 'En Contra' : order.project.stance === 'FAVOR' ? 'A Favor' : order.project.stance}
                                    </Badge>
                                    {order.project.target?.name && (
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            Objetivo: {order.project.target.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                    <AlignLeft className="h-3 w-3" /> Intención (Prompt)
                                </span>
                                <p className="text-sm font-medium text-foreground line-clamp-3 mt-0.5" title={order.intent || "Sin intención específica"}>
                                    {order.intent ? order.intent : <span className="text-muted-foreground font-normal italic">Sin intención específica</span>}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" /> Creado el
                                </span>
                                <p className="text-sm font-medium mt-0.5">
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" /> Progreso de la Orden
                            </span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-4xl font-black text-primary tracking-tighter">{order.genComments.length}</span>
                                <span className="text-sm font-medium text-muted-foreground">de {order.quantity}</span>
                                <span className="text-xs text-muted-foreground ml-auto uppercase font-bold tracking-wider">Completados</span>
                            </div>
                            
                            {/* Simple progress bar */}
                            <div className="h-2.5 w-full bg-secondary rounded-full mt-2 overflow-hidden border border-border/50">
                                <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
                                    style={{ width: `${Math.min(100, Math.max(0, (order.genComments.length / order.quantity) * 100))}%` }} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1">
                                    Red Social
                                </span>
                                <div className="flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium capitalize">{order.socialNetwork.toLowerCase()}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-1">
                                    Contenido
                                </span>
                                <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium capitalize">{order.postType.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Comentarios</CardTitle>
                    <CardDescription>
                        Total: {order.genComments.length} comentarios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InteractionTableClient interactions={order.genComments} type="COMENTARIO" />
                </CardContent>
            </Card>
        </div>
    )
}
