"use client"

import { useState, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EditableCommentRow } from "./editable-comment-row"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { Search, Filter, ArrowUpDown, Loader2 } from "lucide-react"
import { updateInteractionStatus } from "@/lib/actions/orders"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function InteractionTableClient({ interactions, type }: { interactions: any[], type: string }) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})

    const handleToggleStatus = async (item: any) => {
        setLoadingMap(prev => ({ ...prev, [item.id]: true }))
        const newStatus = item.status === "PUBLICADO" ? "SINPUBLICAR" : "PUBLICADO"
        const result = await updateInteractionStatus(item.id, type as any, newStatus as any)
        setLoadingMap(prev => ({ ...prev, [item.id]: false }))

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success(`Estado actualizado a ${newStatus === "PUBLICADO" ? "EJECUTADO" : "SIN EJECUTAR"}`)
    }


    const filteredInteractions = useMemo(() => {
        return interactions
            .filter((item) => {
                const matchesSearch = 
                    (item.text?.toLowerCase().includes(search.toLowerCase())) ||
                    (item.device?.deviceName?.toLowerCase().includes(search.toLowerCase())) ||
                    (item.device?.label?.toLowerCase().includes(search.toLowerCase())) ||
                    (item.id.toString().includes(search))
                
                const matchesStatus = 
                    statusFilter === "all" || 
                    item.status === statusFilter
                
                return matchesSearch && matchesStatus
            })
            .sort((a, b) => {
                const dateA = new (globalThis as any).Date(a.createdAt).getTime()
                const dateB = new (globalThis as any).Date(b.createdAt).getTime()
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB
            })
    }, [interactions, search, statusFilter, sortOrder])

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg border">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por texto, device o ID..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 grow md:grow-0">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent {...({} as any)}>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="PUBLICADO">Publicados (Ejecutados)</SelectItem>
                                <SelectItem value="SINPUBLICAR">Sin Publicar (Pendientes)</SelectItem>
                                <SelectItem value="CANCELADO">Cancelados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                        <SelectTrigger className="w-[140px]">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Orden" />
                        </SelectTrigger>
                        <SelectContent {...({} as any)}>
                            <SelectItem value="desc">Más recientes</SelectItem>
                            <SelectItem value="asc">Más antiguos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            {type === "COMENTARIO" && <TableHead>Contenido</TableHead>}
                            <TableHead>Dispositivo Asignado</TableHead>
                            <TableHead className="w-[150px]">Estado</TableHead>
                            <TableHead className="w-[150px] text-right">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInteractions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={type === "COMENTARIO" ? 5 : 4} className="text-center py-12 text-muted-foreground">
                                    No se encontraron registros con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInteractions.map((item: any) => {
                                if (type === "COMENTARIO") {
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
                                            <div className="flex items-center gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Badge
                                                            variant={
                                                                item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className={`cursor-pointer hover:opacity-80 transition-opacity ${
                                                                item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {item.status === "PUBLICADO" ? "EJECUTADO" : item.status === "SINPUBLICAR" ? "SIN EJECUTAR" : item.status}
                                                        </Badge>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent {...({} as any)}>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Está seguro de cambiar el estado?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Deseas cambiar el estado de este registro a <strong>{item.status === "PUBLICADO" ? "SIN EJECUTAR" : "EJECUTADO"}</strong>?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleToggleStatus(item)}>Confirmar Cambio</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                {loadingMap[item.id] && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {formatDateTime(item.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
