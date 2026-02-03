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
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"

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
                    <p className="text-muted-foreground">
                        {order.project.name} · {order.socialNetwork} · {order.postType}
                    </p>
                </div>
            </div>

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
