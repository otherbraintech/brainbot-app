"use client"

import { useState } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { updateGenComment } from "@/lib/actions/orders"
import { toast } from "sonner"

export function EditableCommentRow({ comment }: { comment: any }) {
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

    const statusMap: Record<string, string> = {
        "SINPUBLICAR": "SIN EJECUTAR",
        "PUBLICADO": "EJECUTADO"
    }

    const displayStatus = statusMap[comment.status] || comment.status

    return (
        <TableRow>
            <TableCell className="font-medium">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className="h-8 min-w-[300px]"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') {
                                    setText(comment.text)
                                    setIsEditing(false)
                                }
                            }}
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                                setText(comment.text)
                                setIsEditing(false)
                            }}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <span>{comment.text}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </TableCell>
            <TableCell>
                <code className="text-xs bg-muted px-1 rounded">
                    {comment.device?.deviceName || "N/A"}
                </code>
            </TableCell>
            <TableCell>
                <Badge variant={comment.status === "PUBLICADO" ? "default" : "secondary"}>
                    {displayStatus}
                </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString("es")}
            </TableCell>
        </TableRow>
    )
}
