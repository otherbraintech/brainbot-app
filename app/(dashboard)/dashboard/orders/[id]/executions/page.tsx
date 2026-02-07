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
import { ArrowLeft, Activity, UserPlus, Heart, Share2, AlertTriangle, MessageSquare, ExternalLink, Globe, Hash, Info, Layers } from "lucide-react"
import Link from "next/link"
import { CopyUrlButton } from "@/components/orders/copy-url-button"

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
                    <p className="text-muted-foreground text-sm">
                        {order.project.name} · Verificando ejecución de la orden
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-indigo-100 bg-indigo-50/10">
                <CardHeader className="pb-3 border-b bg-white/50">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-lg">Información de la Orden</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-white">
                            {order.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Enlace de la Publicación
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white border rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <Hash className="h-3 w-3" /> Cantidad
                            </span>
                            <p className="text-lg font-bold">{interactions.length} de {order.quantity} <span className="text-xs font-normal text-muted-foreground">finalizados</span></p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Detalles
                            </span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">
                                    {order.socialNetwork.toLowerCase()}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                    {order.postType.toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles de Ejecución</CardTitle>
                    <CardDescription>
                        Mostrando {interactions.length} registros de {config.label.toLowerCase()}
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
                                interactions.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                                            #{item.id}
                                        </TableCell>
                                        {order.type === "COMENTARIO" && (
                                            <TableCell className="max-w-[300px] truncate italic text-muted-foreground">
                                                {item.text}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-sm">
                                                    {item.device?.deviceName || "Sin asignar"}
                                                </span>
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
                                                {item.status}
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
