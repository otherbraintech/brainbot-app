"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createProject } from "@/lib/actions/projects"

export function CreateProjectButton() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createProject(name)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            setName("")
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Proyecto</DialogTitle>
                        <DialogDescription>
                            Ingresa el nombre del proyecto. Podrás agregar órdenes de comentarios después.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {error && (
                            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        <Input
                            placeholder="Nombre del proyecto"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            minLength={2}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" className="border-slate-200 shadow-sm" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
