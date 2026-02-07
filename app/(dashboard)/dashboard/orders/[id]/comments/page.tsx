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
import { ArrowLeft, MessageSquare, ExternalLink, Globe, Hash, Info } from "lucide-react"
import Link from "next/link"
import { CopyUrlButton } from "@/components/orders/copy-url-button"

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
                <CardContent className="pt-4 grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Enlace de la Publicación
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted/20 border rounded-md px-3 py-1.5 text-sm text-muted-foreground truncate">
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
                            <p className="text-lg font-bold">{order.genComments.length} de {order.quantity} <span className="text-xs font-normal text-muted-foreground">finalizados</span></p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> Red Social
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
                    <CardTitle>Lista de Comentarios</CardTitle>
                    <CardDescription>
                        Total: {order.genComments.length} comentarios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Comentario</TableHead>
                                <TableHead className="w-[120px]">Dispositivo</TableHead>
                                <TableHead className="w-[100px]">Estado</TableHead>
                                <TableHead className="w-[150px] text-right">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.genComments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        No hay comentarios generados aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                order.genComments.map((comment: any) => (
                                    <TableRow key={comment.id}>
                                        <TableCell className="font-medium">{comment.text}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-1 rounded">
                                                {comment.device?.deviceName || "N/A"}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={comment.status === "PUBLICADO" ? "default" : "secondary"}>
                                                {comment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {new (globalThis as any).Date(comment.createdAt).toLocaleDateString("es")}
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
