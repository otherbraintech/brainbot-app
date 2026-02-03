"use client"

import { useEffect, useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOut } from "lucide-react"

export function AuthErrorModal({ user }: { user: any }) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // If we're in the dashboard area but have no user, show modal
        if (!user) {
            setOpen(true)
        }
    }, [user])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        window.location.href = "/login"
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen} {...({} as any)}>
            <AlertDialogContent {...({} as any)}>
                <AlertDialogHeader {...({} as any)}>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive" {...({} as any)}>
                        Ocurrió un error con tu sesión
                    </AlertDialogTitle>
                    <AlertDialogDescription {...({} as any)}>
                        No hemos podido validar tu cuenta. Es posible que tu sesión haya expirado o tu usuario no sea válido. Por favor, vuelve a iniciar sesión.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter {...({} as any)}>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" {...({} as any)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión e ir al Login
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
