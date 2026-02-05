import { getDevices } from "@/lib/actions/devices"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CreateDeviceButton, EditDeviceButton, DeleteDeviceButton, ViewDeviceButton } from "@/components/devices/device-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Facebook, Instagram, Video } from "lucide-react"
import { TikTokIcon } from "@/components/icons/tiktok-icon"
import Link from "next/link"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    LIBRE: { label: "Libre", variant: "secondary" },
    OCUPADO: { label: "Ocupado", variant: "default" },
    BLOQUEADO: { label: "Bloqueado", variant: "destructive" },
}

export default async function DevicesPage() {
    const devices = await getDevices()

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
                        <h1 className="text-2xl font-bold">Dispositivos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los dispositivos conectados al sistema
                        </p>
                    </div>
                </div>
                <CreateDeviceButton />
            </div>

            {devices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                    No hay dispositivos registrados
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Nombre del Dispositivo</TableHead>
                                <TableHead>Persona Asignada</TableHead>
                                <TableHead>Etiqueta</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Redes</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map((device, index) => {
                                const statusInfo = STATUS_LABELS[device.status] || { label: device.status, variant: "outline" as const }
                                return (
                                    <TableRow key={device.id}>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {device.deviceName}
                                        </TableCell>
                                        <TableCell>
                                            {device.personName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-primary/80">
                                                {device.label || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {device.phoneNumber || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {device.urlInstagram ? (
                                                    <a href={device.urlInstagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                                                        <Instagram className="h-4 w-4" />
                                                    </a>
                                                ) : <Instagram className="h-4 w-4 text-muted-foreground/30" />}
                                                {device.urlFacebook ? (
                                                    <a href={device.urlFacebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                                        <Facebook className="h-4 w-4" />
                                                    </a>
                                                ) : <Facebook className="h-4 w-4 text-muted-foreground/30" />}
                                                {device.urlTiktok ? (
                                                    <a href={device.urlTiktok} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300">
                                                        <TikTokIcon className="h-4 w-4" />
                                                    </a>
                                                ) : <TikTokIcon className="h-4 w-4 text-muted-foreground/30" />}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <ViewDeviceButton device={device} />
                                                <EditDeviceButton device={device} />
                                                <DeleteDeviceButton device={device} />
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
