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
import { createDevice, updateDevice, deleteDevice } from "@/lib/actions/devices"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Device = {
    id: string
    deviceName: string
    personName: string | null
    status: string
    urlTiktok: string | null
    urlFacebook: string | null
    urlInstagram: string | null
}

// Create Device Dialog
export function CreateDeviceButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deviceName, setDeviceName] = useState("")
    const [personName, setPersonName] = useState("")

    const [urlTiktok, setUrlTiktok] = useState("")
    const [urlFacebook, setUrlFacebook] = useState("")
    const [urlInstagram, setUrlInstagram] = useState("")

    const handleSubmit = async () => {
        if (!deviceName.trim()) return
        setLoading(true)
        await createDevice({
            deviceName,
            personName: personName || undefined,
            urlTiktok: urlTiktok || undefined,
            urlFacebook: urlFacebook || undefined,
            urlInstagram: urlInstagram || undefined,
        })
        setLoading(false)
        setOpen(false)
        setDeviceName("")
        setPersonName("")
        setUrlTiktok("")
        setUrlFacebook("")
        setUrlInstagram("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Dispositivo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Dispositivo</DialogTitle>
                    <DialogDescription>
                        Añade un nuevo dispositivo al sistema
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="deviceName">Nombre del Dispositivo *</Label>
                        <Input
                            id="deviceName"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="Dispositivo 1"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="personName">Persona Asignada</Label>
                        <Input
                            id="personName"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            placeholder="Nombre de la persona"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="urlTiktok">URL TikTok</Label>
                        <Input
                            id="urlTiktok"
                            value={urlTiktok}
                            onChange={(e) => setUrlTiktok(e.target.value)}
                            placeholder="https://tiktok.com/@..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="urlFacebook">URL Facebook</Label>
                        <Input
                            id="urlFacebook"
                            value={urlFacebook}
                            onChange={(e) => setUrlFacebook(e.target.value)}
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="urlInstagram">URL Instagram</Label>
                        <Input
                            id="urlInstagram"
                            value={urlInstagram}
                            onChange={(e) => setUrlInstagram(e.target.value)}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !deviceName.trim()}>
                        {loading ? "Creando..." : "Crear"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Edit Device Dialog
export function EditDeviceButton({ device }: { device: Device }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deviceName, setDeviceName] = useState(device.deviceName)
    const [personName, setPersonName] = useState(device.personName || "")
    const [status, setStatus] = useState(device.status)
    const [urlTiktok, setUrlTiktok] = useState(device.urlTiktok || "")
    const [urlFacebook, setUrlFacebook] = useState(device.urlFacebook || "")
    const [urlInstagram, setUrlInstagram] = useState(device.urlInstagram || "")

    const handleSubmit = async () => {
        if (!deviceName.trim()) return
        setLoading(true)
        await updateDevice({
            id: device.id,
            deviceName,
            personName: personName || undefined,
            urlTiktok: urlTiktok || undefined,
            urlFacebook: urlFacebook || undefined,
            urlInstagram: urlInstagram || undefined,
            status: status as "LIBRE" | "OCUPADO" | "BLOQUEADO",
        })
        setLoading(false)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Dispositivo</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del dispositivo
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="editDeviceName">Nombre del Dispositivo *</Label>
                        <Input
                            id="editDeviceName"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editPersonName">Persona Asignada</Label>
                        <Input
                            id="editPersonName"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editUrlTiktok">URL TikTok</Label>
                        <Input
                            id="editUrlTiktok"
                            value={urlTiktok}
                            onChange={(e) => setUrlTiktok(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editUrlFacebook">URL Facebook</Label>
                        <Input
                            id="editUrlFacebook"
                            value={urlFacebook}
                            onChange={(e) => setUrlFacebook(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editUrlInstagram">URL Instagram</Label>
                        <Input
                            id="editUrlInstagram"
                            value={urlInstagram}
                            onChange={(e) => setUrlInstagram(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="editStatus">Estado</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LIBRE">Libre</SelectItem>
                                <SelectItem value="OCUPADO">Ocupado</SelectItem>
                                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !deviceName.trim()}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Delete Device Button
export function DeleteDeviceButton({ device }: { device: Device }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar el dispositivo "${device.deviceName}"?`)) return
        setLoading(true)
        await deleteDevice(device.id)
        setLoading(false)
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
    )
}
