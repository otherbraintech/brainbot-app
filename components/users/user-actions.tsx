"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createUser, updateUser, deleteUser } from "@/lib/actions/users"
import { Plus, Pencil, Trash2 } from "lucide-react"

type User = {
    id: string
    name: string
    username: string
    role: string
    plan: string
    commentLimit: number
    commentsUsed: number
}

// Create User Dialog
export function CreateUserButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("USUARIO")
    const [plan, setPlan] = useState("GRATIS")
    const [commentLimit, setCommentLimit] = useState("500")
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!name.trim() || !username.trim() || !password.trim()) return
        setLoading(true)
        setError("")
        const result = await createUser({
            name,
            username,
            password,
            role: role as "ADMIN" | "USUARIO",
            plan: plan as "GRATIS" | "PRO",
            commentLimit: parseInt(commentLimit) || 500,
        })
        setLoading(false)
        if (result.error) {
            setError(result.error)
            return
        }
        setOpen(false)
        setName("")
        setUsername("")
        setPassword("")
        setRole("USUARIO")
        setPlan("GRATIS")
        setCommentLimit("500")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Usuario</DialogTitle>
                    <DialogDescription>
                        Añade un nuevo usuario al sistema
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Juan Pérez"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="username">Usuario *</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="juanperez"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USUARIO">Usuario</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="plan">Plan</Label>
                            <Select value={plan} onValueChange={setPlan}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GRATIS">Gratis</SelectItem>
                                    <SelectItem value="PRO">Pro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="commentLimit">Límite de Comentarios</Label>
                        <Input
                            id="commentLimit"
                            type="number"
                            value={commentLimit}
                            onChange={(e) => setCommentLimit(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" className="border-slate-200 shadow-sm" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !name.trim() || !username.trim() || !password.trim()}>
                        {loading ? "Creando..." : "Crear"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Edit User Dialog
export function EditUserButton({ user }: { user: User }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(user.name)
    const [username, setUsername] = useState(user.username)
    const [password, setPassword] = useState("")
    const [role, setRole] = useState(user.role)
    const [plan, setPlan] = useState(user.plan)
    const [commentLimit, setCommentLimit] = useState(String(user.commentLimit))
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!name.trim() || !username.trim()) return
        setLoading(true)
        setError("")
        const result = await updateUser({
            id: user.id,
            name,
            username,
            password: password || undefined,
            role: role as "ADMIN" | "USUARIO",
            plan: plan as "GRATIS" | "PRO",
            commentLimit: parseInt(commentLimit) || 500,
        })
        setLoading(false)
        if (result.error) {
            setError(result.error)
            return
        }
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="icon" className="border-slate-200 shadow-sm">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && (
                        <div className="text-sm text-destructive">{error}</div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="editName">Nombre *</Label>
                        <Input
                            id="editName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editUsername">Usuario *</Label>
                        <Input
                            id="editUsername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editPassword">Nueva Contraseña (dejar vacío para no cambiar)</Label>
                        <Input
                            id="editPassword"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editRole">Rol</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USUARIO">Usuario</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editPlan">Plan</Label>
                            <Select value={plan} onValueChange={setPlan}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GRATIS">Gratis</SelectItem>
                                    <SelectItem value="PRO">Pro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editCommentLimit">Límite de Comentarios</Label>
                        <Input
                            id="editCommentLimit"
                            type="number"
                            value={commentLimit}
                            onChange={(e) => setCommentLimit(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" className="border-slate-200 shadow-sm" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !name.trim() || !username.trim()}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Delete User Button
export function DeleteUserButton({ user }: { user: User }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar el usuario "${user.name}"?`)) return
        setLoading(true)
        await deleteUser(user.id)
        setLoading(false)
    }

    return (
        <Button variant="secondary" size="icon" className="border-slate-200 shadow-sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
    )
}
