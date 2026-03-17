import { getOrder } from "@/lib/actions/orders"
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
import { ArrowLeft, Activity, UserPlus, Heart, Share2, AlertTriangle, MessageSquare, ExternalLink, Globe, Hash, Info, Layers, Target, CalendarDays, AlignLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { CopyUrlButton } from "@/components/orders/copy-url-button"
import { DownloadPDFButton } from "@/components/orders/download-pdf-button"
import { EditableCommentRow } from "@/components/orders/editable-comment-row"

const TYPE_CONFIG: any = {
    COMENTARIO: { label: "Comentarios", icon: MessageSquare, color: "text-blue-600" },
    MEGUSTA: { label: "Me gusta", icon: Heart, color: "text-rose-600" },
    COMPARTIR: { label: "Compartidos", icon: Share2, color: "text-green-600" },
    SEGUIMIENTO: { label: "Seguidores", icon: UserPlus, color: "text-indigo-600" },
    REPORTE: { label: "Reportes", icon: AlertTriangle, color: "text-amber-600" },
}

export default async function OrderExecutionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrder(id)

    if (!order) {
        notFound()
    }

    const config = TYPE_CONFIG[order.type] || { label: "Ejecución", icon: Activity, color: "text-primary" }

    // Unificar arrays de interacciones
    const interactions = (order.type === "COMENTARIO" ? order.genComments :
        order.type === "MEGUSTA" ? (order as any).genLikes :
            order.type === "COMPARTIR" ? (order as any).genShares :
                order.type === "SEGUIMIENTO" ? (order as any).genFollows :
                    (order as any).genReports) || []

    const publishedCount = interactions.filter((i: any) => i.status === "PUBLICADO").length;
    const generatedCount = interactions.filter((i: any) => i.status === "PUBLICADO" || i.status === "SINPUBLICAR").length;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/projects/${order.projectId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <config.icon className={`h-6 w-6 ${config.color}`} />
                        {order.orderName || `Ejecución de ${config.label}`}
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground text-sm">
                            {order.project.name} · Verificando ejecución de la orden
                        </p>
                        <Badge variant="secondary" className="font-mono text-[10px] h-4 px-1.5 py-0">#{order.id}</Badge>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-border bg-card">
                <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">Información de la Orden</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <DownloadPDFButton orderId={order.id} orderName={order.orderName} />
                            <Badge variant="outline" className="bg-background">
                                {order.status === 'GENERADA' ? 'En Operación' : order.status === 'COMPLETADA' ? 'Finalizada' : order.status}
                            </Badge>
                        </div>
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
                                            order.project?.stance === 'AGAINST' 
                                                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50' 
                                                : order.project?.stance === 'FAVOR' 
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' 
                                                : ''
                                        }
                                    >
                                        {order.project?.stance === 'AGAINST' ? 'En Contra' : order.project?.stance === 'FAVOR' ? 'A Favor' : order.project?.stance || 'N/A'}
                                    </Badge>
                                    {order.project?.target?.name && (
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
                                    {new (globalThis as any).Date(order.createdAt).toLocaleDateString("es-ES", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
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
                                <span className="text-4xl font-black text-primary tracking-tighter">{publishedCount}</span>
                                <span className="text-sm font-medium text-muted-foreground">de {generatedCount} generados</span>
                            </div>
                            
                            <div className="h-2.5 w-full bg-secondary rounded-full mt-2 overflow-hidden border border-border/50">
                                <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
                                    style={{ width: `${Math.min(100, Math.max(0, generatedCount > 0 ? (publishedCount / generatedCount) * 100 : 0))}%` }} 
                                />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium flex gap-1 mt-1">
                                Meta Total de la Orden: <span className="font-bold text-foreground">{order.quantity}</span>
                            </span>
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
                                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium capitalize">{order.postType.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de Ejecución</CardTitle>
                    <CardDescription>
                        Mostrando {generatedCount} ejecuciones ({publishedCount} ejecutados)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                {order.type === "COMENTARIO" && <TableHead>Contenido</TableHead>}
                                <TableHead>Dispositivo Asignado</TableHead>
                                <TableHead className="w-[120px]">Estado</TableHead>
                                <TableHead className="w-[150px] text-right">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={order.type === "COMENTARIO" ? 5 : 4} className="text-center py-12 text-muted-foreground">
                                        <config.icon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No hay registros de ejecución para esta orden aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interactions.map((item: any) => {
                                    if (order.type === "COMENTARIO") {
                                        return <EditableCommentRow key={item.id} comment={item} variant="execution" />
                                    }

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                #{item.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium text-sm">
                                                        {item.device?.deviceName || "Sin asignar"}
                                                    </span>
                                                    {item.device?.label && (
                                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">
                                                            {item.device.label}
                                                        </span>
                                                    )}
                                                    {item.device?.personName && (
                                                        <span className="text-[10px] text-muted-foreground italic">
                                                            {item.device.personName}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className={
                                                        item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                                            : ""
                                                    }
                                                >
                                                    {item.status === "PUBLICADO" ? "EJECUTADO" : item.status === "SINPUBLICAR" ? "SIN EJECUTAR" : item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {new (globalThis as any).Date(item.createdAt).toLocaleString("es", {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
