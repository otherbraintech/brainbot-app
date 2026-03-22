"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Check, X, Loader2, Trash2, RefreshCw } from "lucide-react"
import { updateGenComment, deleteGenComment, updateInteractionStatus } from "@/lib/actions/orders"
import { toast } from "sonner"
import { formatDate, formatDateTime } from "@/lib/utils"
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

export function EditableCommentRow({ 
    comment, 
    variant = "default",
    index
}: { 
    comment: any, 
    variant?: "default" | "execution",
    index?: number
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(comment.text)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async () => {
        if (!text.trim()) return

        setIsLoading(true)
        const result = await updateGenComment(comment.id, text)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success("Comentario actualizado")
        setIsEditing(false)
    }

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que deseas eliminar este comentario permanentemente?")) return

        setIsLoading(true)
        const result = await deleteGenComment(comment.id)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success("Comentario eliminado")
    }

    const handleToggleStatus = async () => {
        setIsLoading(true)
        const newStatus = comment.status === "PUBLICADO" ? "SINPUBLICAR" : "PUBLICADO"
        const result = await updateInteractionStatus(comment.id, "COMENTARIO", newStatus as any)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success(`Estado actualizado a ${newStatus === "PUBLICADO" ? "EJECUTADO" : "SIN EJECUTAR"}`)
    }

    const statusMap: Record<string, string> = {
        "SINPUBLICAR": "SIN EJECUTAR",
        "PUBLICADO": "EJECUTADO"
    }

    const displayStatus = statusMap[comment.status] || comment.status

    if (variant === "execution") {
        return (
            <TableRow className="group hover:bg-muted/30 transition-colors">
                <TableCell className="text-xs font-bold text-muted-foreground/50">
                    {index}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                    #{comment.id}
                </TableCell>
                <TableCell>
                    {isEditing ? (
                        <div className="flex flex-col gap-2 w-full min-w-[300px]">
                            <Textarea 
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                className="min-h-[80px] w-full italic text-sm resize-none focus-visible:ring-primary shadow-sm"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline"
                                    size="sm" 
                                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 gap-1 shadow-sm"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                    Guardar
                                </Button>
                                <Button 
                                    variant="outline"
                                    size="sm" 
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1 shadow-sm"
                                    onClick={() => {
                                        setText(comment.text)
                                        setIsEditing(false)
                                    }}
                                    disabled={isLoading}
                                >
                                    <X className="h-3 w-3" />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                     ) : (
                        <div className="flex items-start gap-1 py-1 text-foreground/90 text-[13px] leading-relaxed max-w-[500px] font-medium">
                            <span className="whitespace-normal break-words">{comment.text}</span>
                        </div>
                    )}
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1 py-0.5">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm text-foreground">
                                {comment.device?.personName || "Usuario Desconocido"}
                            </span>
                            {comment.device?.label && (
                                <span className="text-[9px] font-black text-primary/70 uppercase tracking-tighter px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                                    {comment.device.label}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <span className="font-mono text-[10px] tabular-nums uppercase tracking-tight">
                                {comment.device?.deviceName || "Sin dispositivo"}
                            </span>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center justify-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Badge
                                    variant={comment.status === "PUBLICADO" ? "default" : "secondary"}
                                    className={`cursor-pointer hover:opacity-80 transition-all shadow-sm font-black text-[10px] uppercase tracking-wider h-6 px-3 ${
                                        comment.status === "PUBLICADO"
                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                            : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                    }`}
                                >
                                    {displayStatus}
                                </Badge>
                            </AlertDialogTrigger>
                            <AlertDialogContent {...({} as any)}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está seguro de cambiar el estado?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Deseas cambiar el estado de este registro a <strong>{comment.status === "PUBLICADO" ? "SIN EJECUTAR" : "EJECUTADO"}</strong>?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleToggleStatus}>Confirmar Cambio</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                    </div>
                </TableCell>
                <TableCell className="text-center text-[11px] text-muted-foreground font-bold">
                    {formatDateTime(comment.updatedAt || comment.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-colors" 
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                            title="Editar comentario"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" 
                            onClick={handleDelete}
                            disabled={isLoading}
                            title="Eliminar registro"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow>
            <TableCell className="font-medium">
                {isEditing ? (
                    <div className="flex flex-col gap-2 w-full">
                        <Textarea 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className="min-h-[80px] w-full text-sm resize-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="outline"
                                size="sm" 
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                Guardar
                            </Button>
                            <Button 
                                variant="outline"
                                size="sm" 
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                onClick={() => {
                                    setText(comment.text)
                                    setIsEditing(false)
                                }}
                                disabled={isLoading}
                            >
                                <X className="h-3 w-3" />
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-1 group">
                        <span className="whitespace-normal break-words">{comment.text}</span>
                        <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => setIsEditing(true)}
                                disabled={isLoading}
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-muted px-1 rounded">
                        {comment.device?.deviceName || "N/A"}
                    </code>
                    {comment.device?.label && (
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                            ({comment.device.label})
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Badge 
                                variant={comment.status === "PUBLICADO" ? "default" : "secondary"}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                {displayStatus}
                            </Badge>
                        </AlertDialogTrigger>
                        <AlertDialogContent {...({} as any)}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro de cambiar el estado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Deseas cambiar el estado de este registro a <strong>{comment.status === "PUBLICADO" ? "SIN EJECUTAR" : "EJECUTADO"}</strong>?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleToggleStatus}>Confirmar Cambio</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
                {formatDate(comment.createdAt)}
            </TableCell>
        </TableRow>
    )
}
