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
import { CreateDeviceButton, EditDeviceButton, DeleteDeviceButton } from "@/components/devices/device-actions"

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
                <div>
                    <h1 className="text-2xl font-bold">Dispositivos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los dispositivos conectados al sistema
                    </p>
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
                                <TableHead>Nombre del Dispositivo</TableHead>
                                <TableHead>Persona Asignada</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map((device) => {
                                const statusInfo = STATUS_LABELS[device.status] || { label: device.status, variant: "outline" as const }
                                return (
                                    <TableRow key={device.id}>
                                        <TableCell className="font-medium">
                                            {device.deviceName}
                                        </TableCell>
                                        <TableCell>
                                            {device.personName || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
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
