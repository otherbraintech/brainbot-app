"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"
import {
    Users,
    FolderOpen,
    ListChecks,
    Smartphone,
    MessageSquare,
    Zap,
    Activity,
    Layers,
    BarChart3,
    CheckCircle2,
    XCircle,
    PlayCircle,
    UserCircle2
} from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { getDashboardStats } from "@/lib/actions/dashboard"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardPage() {
    const [stats, setStats] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        getDashboardStats().then(data => {
            setStats(data)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!stats) return null

    // Chart Configurations
    const activityConfig = {
        count: {
            label: "Órdenes",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    const socialConfig = {
        INSTAGRAM: { label: "Instagram", color: "#E1306C" },
        TIKTOK: { label: "TikTok", color: "#000000" },
        FACEBOOK: { label: "Facebook", color: "#1877F2" },
    } satisfies ChartConfig

    const deviceConfig = {
        LIBRE: { label: "Libre", color: "#22c55e" },
        OCUPADO: { label: "Ocupado", color: "#f59e0b" },
        BLOQUEADO: { label: "Bloqueado", color: "#ef4444" },
    } satisfies ChartConfig

    // Prepare Pie Data
    const pieData = stats.socialDistribution
        .filter((s: any) => ["INSTAGRAM", "TIKTOK", "FACEBOOK"].includes(s.socialNetwork))
        .map((s: any) => ({
            name: s.socialNetwork,
            value: s._count,
            fill: (socialConfig as any)[s.socialNetwork]?.color || "gray"
        }))

    // Prepare Device Data for Pie
    const deviceStatusData = stats.deviceStatus.map((d: any) => ({
        name: d.status,
        value: d._count,
        fill: (deviceConfig as any)[d.status]?.color || "gray"
    }))

    // Prepare Users Plan Data (Admin)
    const planData = stats.usersByPlan?.map((p: any) => ({
        name: p.plan,
        value: p._count
    })) || []


    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Panel General
                </h1>
                <p className="text-muted-foreground text-sm">
                    Vista general del rendimiento del sistema.
                </p>
            </div>

            {/* TOP STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Proyectos Activos"
                    value={stats.totals.projects}
                    icon={FolderOpen}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    label="Órdenes Totales"
                    value={stats.totals.orders}
                    icon={ListChecks}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    label="Interacciones"
                    value={stats.totals.engagement}
                    icon={Zap}
                    color="text-yellow-500"
                    bg="bg-yellow-500/10"
                    subtext="Comentarios + Likes"
                />
                <StatCard
                    label="Dispositivos"
                    value={stats.totals.devices}
                    icon={Smartphone}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
            </div>

            {/* MAIN CHART ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Tendencia de Órdenes</CardTitle>
                        <CardDescription>Volumen diario (últimos 7 días)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyActivity}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#71717A"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.split('-')[2]}
                                />
                                <YAxis
                                    stroke="#71717A"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    {/* SOCIAL PIE */}
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Redes Sociales</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[200px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="text-2xl font-bold">{stats.socialDistribution.reduce((acc: any, curr: any) => acc + curr._count, 0)}</span>
                                    <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 pt-0 flex justify-center gap-4">
                            {pieData.map((d: any) => (
                                <div key={d.name} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                                    <span className="text-xs text-muted-foreground capitalize">{d.name.toLowerCase()}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* STATUS & FEED ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ORDER STATUS */}
                <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Estado de Órdenes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4">
                            {['LISTA', 'GENERANDO', 'GENERADA', 'COMPLETADA', 'CANCELADA', 'REINTENTAR'].map((statusKey) => {
                                const stat = stats.ordersByStatus.find((s: any) => s.status === statusKey)
                                const count = stat ? stat._count : 0
                                return (
                                    <div key={statusKey} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(statusKey)}
                                            <span className="text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
                                                {statusKey.toLowerCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/20"
                                                    style={{ width: `${stats.totals.orders > 0 ? (count / stats.totals.orders) * 100 : 0}%`, backgroundColor: getStatusColor(statusKey) }}
                                                />
                                            </div>
                                            <span className="text-xs font-mono w-4 text-right">{count}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* DEVICE STATUS & LIST */}
                <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Smartphone className="h-4 w-4" /> Dispositivos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6">
                        {/* Mini Bar Chart */}
                        <div className="h-[100px] w-full shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deviceStatusData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                        {deviceStatusData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <Separator />

                        {/* Recent Devices List */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Últimos Activos</p>
                            {stats.recentDevices && stats.recentDevices.length > 0 ? (
                                stats.recentDevices.map((device: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${device.status === 'LIBRE' ? 'bg-green-500' : device.status === 'OCUPADO' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                            <span className="text-xs font-medium truncate max-w-[120px]" title={device.deviceName || device.id}>
                                                {device.personName || device.deviceName || device.id?.substring(0, 8)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {device.batteryLevel ? `${device.batteryLevel}%` : 'N/A'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground italic">No hay dispositivos recientes.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ACTIVITY FEED */}
                <Card className="md:col-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Actividad Reciente
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="h-[350px]">
                        <div className="p-4 space-y-0">
                            {stats.recentLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-2">
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                        <Activity className="h-6 w-6 text-zinc-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Sin actividad registrada hoy.</p>
                                    <p className="text-xs text-zinc-400 max-w-[200px]">Las acciones del sistema y actualizaciones de órdenes aparecerán aquí.</p>
                                </div>
                            ) : (
                                stats.recentLogs.map((log: any, i: number) => (
                                    <div key={i} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                                        <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full border border-background bg-zinc-300 dark:bg-zinc-600" />
                                        <div className="space-y-1 -mt-1">
                                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                                                {log.eventType.replace(/_/g, " ")}
                                            </p>
                                            <p className="text-[11px] text-zinc-500">
                                                {log.project?.name || "Sistema"}
                                            </p>
                                            <p className="text-[10px] text-zinc-400">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, bg, subtext }: any) {
    return (
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${bg} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    {subtext && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{subtext}</Badge>}
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</h3>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'COMPLETADA': return '#10b981' // emerald-500
        case 'CANCELADA': return '#ef4444' // red-500
        case 'GENERANDO': return '#3b82f6' // blue-500
        case 'LISTA': return '#71717a' // zinc-500
        case 'GENERADA': return '#8b5cf6' // violet-500
        case 'REINTENTAR': return '#f59e0b' // amber-500
        case 'FALLIDA': return '#f59e0b' // amber-500 (legacy)
        default: return '#e4e4e7' // zinc-200
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'COMPLETADA': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        case 'CANCELADA': return <XCircle className="h-4 w-4 text-red-500" />
        case 'GENERANDO': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
        case 'LISTA': return <PlayCircle className="h-4 w-4 text-zinc-500" />
        case 'GENERADA': return <CheckCircle2 className="h-4 w-4 text-violet-500" />
        case 'REINTENTAR': return <Activity className="h-4 w-4 text-amber-500" />
        case 'FALLIDA': return <XCircle className="h-4 w-4 text-amber-500" />
        default: return <CheckCircle2 className="h-4 w-4 text-zinc-300" />
    }
}
