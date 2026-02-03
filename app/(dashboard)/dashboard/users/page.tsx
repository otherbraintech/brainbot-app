import { getUsers } from "@/lib/actions/users"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CreateUserButton, EditUserButton, DeleteUserButton } from "@/components/users/user-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    ADMIN: { label: "Administrador", variant: "destructive" },
    USUARIO: { label: "Usuario", variant: "secondary" },
}

const PLAN_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    GRATIS: { label: "Gratis", variant: "outline" },
    PRO: { label: "Pro", variant: "default" },
}

export default async function UsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Usuarios</h1>
                        <p className="text-muted-foreground">
                            Gestiona los usuarios del sistema
                        </p>
                    </div>
                </div>
                <CreateUserButton />
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                    No hay usuarios registrados
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Comentarios</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => {
                                const roleInfo = ROLE_LABELS[user.role] || { label: user.role, variant: "outline" as const }
                                const planInfo = PLAN_LABELS[user.plan] || { label: user.plan, variant: "outline" as const }
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>
                                            @{user.username}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={roleInfo.variant}>
                                                {roleInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={planInfo.variant}>
                                                {planInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.commentsUsed} / {user.commentLimit}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <EditUserButton user={user} />
                                                <DeleteUserButton user={user} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
