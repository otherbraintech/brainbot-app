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

const STATUS_LABELS: any = {
    LISTA: { label: "Lista", variant: "outline" },
    GENERANDO: { label: "Generando", variant: "secondary" },
    GENERADA: { label: "En Cola", variant: "default" },
    CANCELADA: { label: "Cancelada", variant: "destructive" },
    REINTENTAR: { label: "Reintentar", variant: "warning" },
    COMPLETADA: { label: "Completada", variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" },
    PAUSADA: { label: "Pausada", variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200" },
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
    YOUTUBE: "YouTube",
}

const NETWORK_COLORS: Record<string, string> = {
    FACEBOOK: "bg-blue-50 text-blue-700 border-blue-100",
    INSTAGRAM: "bg-pink-50 text-pink-700 border-pink-100",
    TIKTOK: "bg-slate-900 text-white border-slate-800",
    YOUTUBE: "bg-red-50 text-red-700 border-red-100",
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
                                <TableHead>Red Social</TableHead>
                                <TableHead className="text-center">Meta / Realizado</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
                                                {new (globalThis as any).Date(order.createdAt).toLocaleDateString("es", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric"
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isDeleted ? "line-through" : ""}`}>{order.orderName}</span>
                                                    <Link href={`/dashboard/projects/${order.project.id}`} className="text-[10px] text-blue-600 hover:underline">
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
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold border-none ${NETWORK_COLORS[order.socialNetwork] || "bg-muted/50 text-muted-foreground"}`}
                                                >
                                                    {NETWORK_LABELS[order.socialNetwork] || order.socialNetwork}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-bold text-sm">{currentCount}</span>
                                                    <span className="text-muted-foreground text-[10px]">/</span>
                                                    <span className="text-muted-foreground text-xs">{order.quantity}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={status.variant as any}
                                                    className={status.className}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
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
