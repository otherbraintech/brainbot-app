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
import { Plus, Pencil, Trash2, Eye, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Device = {
    id: string
    deviceName: string
    personName: string | null
    label: string | null
    phoneNumber: string | null
    status: string
    urlTiktok: string | null
    urlFacebook: string | null
    urlInstagram: string | null
    blockedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
}

// View Device Dialog
export function ViewDeviceButton({ device }: { device: Device }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalles del Dispositivo</DialogTitle>
                    <DialogDescription>
                        Información completa del dispositivo
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Nombre:</Label>
                        <span className="col-span-3">{device.deviceName}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Persona:</Label>
                        <span className="col-span-3">{device.personName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Estado:</Label>
                        <span className="col-span-3">{device.status}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Etiqueta:</Label>
                        <span className="col-span-3">{device.label || "-"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Teléfono:</Label>
                        <span className="col-span-3">{device.phoneNumber || "-"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Bloqueado:</Label>
                        <span className="col-span-3">
                            {device.blockedAt ? new Date(device.blockedAt).toLocaleString() : "No"}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Creado:</Label>
                        <span className="col-span-3">
                            {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : "-"}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">TikTok:</Label>
                        <span className="col-span-3 truncate">{device.urlTiktok || "-"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Facebook:</Label>
                        <span className="col-span-3 truncate">{device.urlFacebook || "-"}</span>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Instagram:</Label>
                        <span className="col-span-3 truncate">{device.urlInstagram || "-"}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Create Device Dialog
export function CreateDeviceButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deviceName, setDeviceName] = useState("")
    const [personName, setPersonName] = useState("")
    const [label, setLabel] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [urlTiktok, setUrlTiktok] = useState("")
    const [urlFacebook, setUrlFacebook] = useState("")
    const [urlInstagram, setUrlInstagram] = useState("")

    const handleSubmit = async () => {
        if (!deviceName.trim()) return
        setLoading(true)
        await createDevice({
            deviceName,
            personName: personName || undefined,
            label: label || undefined,
            phoneNumber: phoneNumber || undefined,
            urlTiktok: urlTiktok || undefined,
            urlFacebook: urlFacebook || undefined,
            urlInstagram: urlInstagram || undefined,
        })
        setLoading(false)
        setOpen(false)
        setDeviceName("")
        setPersonName("")
        setLabel("")
        setPhoneNumber("")
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="label">Etiqueta</Label>
                            <Input
                                id="label"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Ej: Celular 01"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phoneNumber">Teléfono</Label>
                            <Input
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+569..."
                            />
                        </div>
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
                    <Button variant="secondary" className="border-slate-200" onClick={() => setOpen(false)}>
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
    const [label, setLabel] = useState(device.label || "")
    const [phoneNumber, setPhoneNumber] = useState(device.phoneNumber || "")
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
            label: label || undefined,
            phoneNumber: phoneNumber || undefined,
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
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all duration-300"
                >
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editLabel">Etiqueta</Label>
                            <Input
                                id="editLabel"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editPhoneNumber">Teléfono</Label>
                            <Input
                                id="editPhoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
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
                    <Button variant="secondary" className="border-slate-200" onClick={() => setOpen(false)}>
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
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300" 
            onClick={handleDelete} 
            disabled={loading}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
