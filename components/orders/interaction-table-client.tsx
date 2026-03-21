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
import { Button } from "@/components/ui/button"
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
import { Search, Filter, ArrowUpDown, Loader2, Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
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

export function InteractionTableClient({ 
    interactions, 
    type, 
    generatedCount, 
    publishedCount 
}: { 
    interactions: any[], 
    type: string,
    generatedCount?: number,
    publishedCount?: number
}) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})
    
    // Pagination State
    const [pageSize, setPageSize] = useState(30)
    const [currentPage, setCurrentPage] = useState(1)

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

    const totalPages = Math.ceil(filteredInteractions.length / pageSize)
    const pagedInteractions = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredInteractions.slice(start, start + pageSize)
    }, [filteredInteractions, currentPage, pageSize])

    const startIndex = (currentPage - 1) * pageSize + 1
    const endIndex = Math.min(currentPage * pageSize, filteredInteractions.length)

    return (
        <div className="border border-border/60 rounded-lg overflow-hidden shadow-sm bg-card">
            {/* Unified Header & Filters Bar */}
            <div className="bg-muted/10 border-b">
                <div className="flex flex-row items-center justify-between px-5 py-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-[0.1em] text-foreground">Detalles de Ejecución</h2>
                    </div>
                    {generatedCount !== undefined && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted-foreground uppercase hidden sm:inline">Progreso de Orden:</span>
                            <Badge variant="secondary" className="text-xs font-black h-6 px-3 bg-primary/10 text-primary border-primary/20">
                                {publishedCount} / {generatedCount} <span className="ml-1 opacity-60">Ejecutados</span>
                            </Badge>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-3 px-5 shadow-inner">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar en ejecuciones..."
                            className="h-10 pl-10 text-sm bg-background border-muted-foreground/20 focus:ring-primary/20 focus:border-primary"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 grow md:grow-0">
                            <Select value={statusFilter} onValueChange={(val) => {
                                setStatusFilter(val)
                                setCurrentPage(1)
                            }}>
                                <SelectTrigger className="h-10 w-full md:w-[180px] text-sm font-medium bg-background border-muted-foreground/20">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent {...({} as any)}>
                                    <SelectItem value="all">Todos los registros</SelectItem>
                                    <SelectItem value="PUBLICADO">Solo Ejecutados</SelectItem>
                                    <SelectItem value="SINPUBLICAR">Solo Pendientes</SelectItem>
                                    <SelectItem value="CANCELADO">Solo Cancelados</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
                            <SelectTrigger className="h-10 w-[140px] text-sm font-medium bg-background border-muted-foreground/20">
                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Orden" />
                            </SelectTrigger>
                            <SelectContent {...({} as any)}>
                                <SelectItem value="desc">Más Recientes</SelectItem>
                                <SelectItem value="asc">Más Antiguos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-[50px] font-black text-[10px] uppercase tracking-wider text-muted-foreground py-4">#</TableHead>
                            <TableHead className="w-[80px] font-black text-[10px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                            {type === "COMENTARIO" && <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground">Contenido generado</TableHead>}
                            <TableHead className="font-black text-[10px] uppercase tracking-wider text-muted-foreground">Dispositivo y Usuario</TableHead>
                            <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-wider text-muted-foreground text-center">Estado de envío</TableHead>
                            <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-wider text-muted-foreground text-center">Última actualización</TableHead>
                            <TableHead className="w-[80px] text-right font-black text-[10px] uppercase tracking-wider text-muted-foreground">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pagedInteractions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={type === "COMENTARIO" ? 7 : 6} className="text-center py-20 text-muted-foreground font-medium">
                                    No se encontraron registros con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pagedInteractions.map((item: any, idx: number) => {
                                const absoluteIdx = (currentPage - 1) * pageSize + idx + 1
                                if (type === "COMENTARIO") {
                                    return <EditableCommentRow key={item.id} comment={item} variant="execution" index={absoluteIdx} />
                                }

                                return (
                                    <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors border-b">
                                        <TableCell className="text-xs font-bold text-muted-foreground/40">
                                            {absoluteIdx}
                                        </TableCell>
                                        <TableCell className="font-mono text-[10px] text-muted-foreground/60">
                                            #{item.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">
                                                        {item.device?.deviceName || "Sin asignar"}
                                                    </span>
                                                    {item.device?.personName && (
                                                        <Badge variant="outline" className="text-[9px] font-bold h-4 px-1 opacity-60">
                                                            {item.device.personName}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {item.device?.label && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-tight">
                                                            {item.device.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Badge
                                                            variant={
                                                                item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className={`cursor-pointer hover:opacity-80 transition-opacity font-bold text-[10px] h-6 px-3 ${
                                                                item.status === "PUBLICADO" || item.status === "CONFIRMADO"
                                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
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
                                        <TableCell className="text-center text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                                            {formatDateTime(item.updatedAt || item.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="text-[9px] font-black opacity-30 px-1">AUTO</Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-muted/10 border-t px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="hidden sm:inline">Filas por página:</span>
                        <Select value={pageSize.toString()} onValueChange={(val) => {
                            setPageSize(parseInt(val))
                            setCurrentPage(1)
                        }}>
                            <SelectTrigger className="h-8 w-[70px] bg-background">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent {...({} as any)}>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs font-bold text-foreground bg-muted/20 px-3 py-1.5 rounded-md border border-border/40">
                        Mostrando <span className="text-primary">{startIndex} - {endIndex}</span> de <span className="text-primary">{filteredInteractions.length}</span> registros
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center px-4 h-8 bg-background border rounded-md text-xs font-black">
                        PÁGINA {currentPage} DE {totalPages || 1}
                    </div>

                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(totalPages)}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
