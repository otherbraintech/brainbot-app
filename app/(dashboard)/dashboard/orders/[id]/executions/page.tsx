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
import { formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { CopyUrlButton } from "@/components/orders/copy-url-button"
import { DownloadPDFButton } from "@/components/orders/download-pdf-button"
import { EditableCommentRow } from "@/components/orders/editable-comment-row"
import { InteractionTableClient } from "@/components/orders/interaction-table-client"

import { OrderExecutionHeader } from "@/components/orders/order-execution-header"

export default async function OrderExecutionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrder(id)

    if (!order) {
        notFound()
    }

    // Unificar arrays de interacciones
    const interactions = (order.type === "COMENTARIO" ? order.genComments :
        order.type === "MEGUSTA" ? (order as any).genLikes :
            order.type === "COMPARTIR" ? (order as any).genShares :
                order.type === "SEGUIMIENTO" ? (order as any).genFollows :
                    (order as any).genReports) || []

    const sortedInteractions = [...interactions].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const publishedCount = sortedInteractions.filter((i: any) => i.status === "PUBLICADO" || i.status === "CONFIRMADO").length
    const generatedCount = sortedInteractions.length

    return (
        <div className="flex flex-col gap-0 mt-[-16px]">
            <OrderExecutionHeader 
                order={order} 
                generatedCount={generatedCount} 
                publishedCount={publishedCount} 
            />

            <div className="bg-background">
                <InteractionTableClient 
                    interactions={sortedInteractions} 
                    type={order.type} 
                    generatedCount={generatedCount}
                    publishedCount={publishedCount}
                />
            </div>
        </div>
    )
}
