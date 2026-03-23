import { getAllOrders } from "@/lib/actions/orders"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { History, ExternalLink, Activity, Video, Image as ImageIcon, Type, Radio, MoreHorizontal, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DownloadPDFButton } from "@/components/orders/download-pdf-button"
import { formatDate } from "@/lib/utils"

const STATUS_LABELS: any = {
    LISTA: { label: "Lista", variant: "outline", className: "text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400" },
    GENERANDO: { label: "Generando", variant: "outline", className: "text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-900/50 dark:text-blue-400" },
    GENERADA: { label: "En Operación", variant: "outline", className: "text-indigo-700 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-900/50 dark:text-indigo-400" },
    CANCELADA: { label: "Cancelada", variant: "outline", className: "text-red-700 border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-900/50 dark:text-red-400" },
    REINTENTAR: { label: "Reintentar", variant: "outline", className: "text-orange-700 border-orange-200 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-900/50 dark:text-orange-400" },
    COMPLETADA: { label: "Completada", variant: "outline", className: "text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-900/50 dark:text-emerald-400" },
    PAUSADA: { label: "Pausada", variant: "outline", className: "text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-900/50 dark:text-amber-400" },
}

const POST_TYPE_LABELS: any = {
    VIDEO: { label: "Video", icon: Video },
    IMAGEN: { label: "Imagen", icon: ImageIcon },
    TEXTO: { label: "Texto", icon: Type },
    LIVE: { label: "Live", icon: Radio },
    OTRO: { label: "Otro", icon: MoreHorizontal },
    PAGINA: { label: "Página", icon: FileText },
    PUBLICACION: { label: "Publicación", icon: FileText },
}

const NETWORK_LABELS: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
}

const NETWORK_COLORS: Record<string, string> = {
    FACEBOOK: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50",
    INSTAGRAM: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-900/50",
    TIKTOK: "bg-slate-900 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-300",
}

export default async function OrdersHistoryPage() {
    const orders = await getAllOrders() as any

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Historial de Órdenes</h1>
                    <p className="text-muted-foreground">
                        Listado completo de todas las órdenes generadas en todos los proyectos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <History className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todas las Órdenes</CardTitle>
                    <CardDescription>
                        Total: {orders.length} órdenes registradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Orden / Proyecto</TableHead>
                                <TableHead>Tipo / Publicación</TableHead>
                                <TableHead className="text-center">Red Social</TableHead>
                                <TableHead className="text-center">Meta / Realizado</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No se encontraron órdenes en el historial.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order: any) => {
                                    const isDeleted = order.deletedAt !== null
                                    const status = isDeleted
                                        ? { label: "Eliminado", variant: "destructive", className: "opacity-70" }
                                        : (STATUS_LABELS[order.status] || { label: order.status, variant: "secondary" })

                                    const currentCount = order.type === "COMENTARIO" ? order._count.genComments :
                                        order.type === "MEGUSTA" ? (order._count as any).genLikes :
                                            order.type === "COMPARTIR" ? (order._count as any).genShares :
                                                order.type === "SEGUIMIENTO" ? (order._count as any).genFollows :
                                                    (order._count as any).genReports

                                    return (
                                        <TableRow key={order.id} className={isDeleted ? "opacity-60 bg-muted/30" : ""}>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {formatDate(order.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold text-sm ${isDeleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                            {order.orderName}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">#{order.id.slice(-6)}</span>
                                                    </div>
                                                    <Link href={`/dashboard/projects/${order.project.id}`} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                                                        {order.project.name}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-none bg-muted/50">
                                                        {order.type}
                                                    </Badge>
                                                    {(() => {
                                                        const pt = POST_TYPE_LABELS[order.postType] || POST_TYPE_LABELS.OTRO
                                                        const Icon = pt.icon
                                                        return (
                                                            <Badge variant="outline" className="text-[10px] uppercase font-bold border-none bg-blue-50 text-blue-700">
                                                                <Icon className="mr-1 h-3 w-3" />
                                                                {pt.label}
                                                            </Badge>
                                                        )
                                                    })()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold border-none ${NETWORK_COLORS[order.socialNetwork] || "bg-muted/50 text-muted-foreground"}`}
                                                >
                                                    {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center justify-center gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-sm tracking-tight">{currentCount}</span>
                                                        <span className="text-muted-foreground text-[10px]">/</span>
                                                        <span className="text-muted-foreground text-xs">{order.quantity}</span>
                                                    </div>
                                                    <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary/80" 
                                                            style={{ width: `${Math.min(100, order.quantity > 0 ? (currentCount / order.quantity) * 100 : 0)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={status.variant as any}
                                                    className={`text-[11px] px-2 py-0.5 whitespace-nowrap ${status.className || ""}`}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right align-middle">
                                                <div className="flex justify-end items-center gap-1">
                                                    <DownloadPDFButton orderId={order.id} orderName={order.orderName} />
                                                    {!isDeleted && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Ver Ejecución">
                                                            <Link href={`/dashboard/orders/${order.id}/executions`}>
                                                                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Ver Enlace">
                                                        <a href={order.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </a>
                                                    </Button>
                                                </div>
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
