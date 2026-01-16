"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getBreadcrumbData } from "@/lib/actions/orders"
import { Fragment } from "react"

const ROUTE_LABELS: { [key: string]: string } = {
    dashboard: "Panel",
    projects: "Proyectos",
    devices: "Dispositivos",
    users: "Usuarios",
    orders: "Órdenes",
    comments: "Comentarios",
    settings: "Configuración",
}

type BreadcrumbItemData = {
    label: string
    href: string
    isLast: boolean
}

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    const [dynamicLabels, setDynamicLabels] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        async function fetchDynamicLabels() {
            const segments = pathname.split("/").filter((s: string) => !!s)
            const projectIndex = segments.indexOf("projects")
            if (projectIndex !== -1 && segments[projectIndex + 1]) {
                const projectId = segments[projectIndex + 1]
                if (projectId.startsWith("cm") || projectId.includes("-")) {
                    try {
                        const res = await fetch(`/api/projects/${projectId}/name`)
                        if (res.ok) {
                            const data = await res.json()
                            setDynamicLabels(prev => ({ ...prev, [projectId]: data.name }))
                        }
                    } catch {
                    }
                }
            }

            const orderIndex = segments.indexOf("orders")
            if (orderIndex !== -1 && segments[orderIndex + 1]) {
                const orderId = segments[orderIndex + 1]
                if (orderId.startsWith("cm") || orderId.includes("-")) {
                    try {
                        const data = await getBreadcrumbData(orderId)
                        if (data) {
                            setDynamicLabels(prev => ({
                                ...prev,
                                [orderId]: data.orderName,
                                [`project_${orderId}`]: data.projectName,
                                [`projectId_${orderId}`]: data.projectId
                            }))
                        }
                    } catch {
                        // ignore
                    }
                }
            }
        }
        fetchDynamicLabels()
    }, [pathname])

    // Split path and filter empty segments
    const segments = pathname.split("/").filter((s) => !!s)

    // Build breadcrumb items
    const breadcrumbItems: BreadcrumbItemData[] = []

    let currentPath = ""
    // Custom Logic for Orders hierarchy: Panel > [Project Name] > [Order Name]
    // If we're deep in orders route and have data
    const orderIndex = segments.indexOf("orders")
    if (orderIndex !== -1 && segments[orderIndex + 1]) {
        const orderId = segments[orderIndex + 1]
        const orderName = dynamicLabels[orderId]
        const projectName = dynamicLabels[`project_${orderId}`]
        const projectId = dynamicLabels[`projectId_${orderId}`]

        if (orderName && projectName && projectId) {
            breadcrumbItems.push({
                label: "Panel",
                href: "/dashboard",
                isLast: false,
            })

            breadcrumbItems.push({
                label: orderName,
                href: `/dashboard/orders/${orderId}/executions`, // Keep user context or direct to main order view? Usually executions is the main view or part of it.
                isLast: segments.length === orderIndex + 2 // if we are at orders/[id]
            })

            // If there's more after [id], like 'executions', hide it if it's the last one, or show it?
            // User requested "Executions" -> Order Name.
            // If we are at /dashboard/orders/[id]/executions
            // The segments are: dashboard, orders, [id], executions
            // My custom logic above handles the first 3 conceptual levels.

            // Actually, let's just REPLACE the items if we match this pattern.
            // If we are at .../executions, we just want to show "Order Name" as the active leaf?
            // User: "debeira decir el nombre de la orden envez de "executions" y en vez de "..." deberia salir el nombre del proyecto"
            // So: Panel > Project > Order

            // If the path IS .../executions, we make "Order" the last item.
            // If the path IS .../orders/[id], we make "Order" the last item.

            // Override whatever loop produced
            return (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard">Panel</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{orderName}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            )
        }
    }

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1

        // Check for dynamic label first, then route labels
        let label = dynamicLabels[segment] || ROUTE_LABELS[segment]

        // If no label found and it looks like an ID, show loading or skip
        if (!label) {
            const isId = segment.startsWith("cm") || segment.includes("-")
            if (isId) {
                label = dynamicLabels[segment] || "..."
            } else {
                label = segment.charAt(0).toUpperCase() + segment.slice(1)
            }
        }

        breadcrumbItems.push({
            label,
            href: currentPath,
            isLast,
        })
    })

    // If empty, show default
    if (breadcrumbItems.length === 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Panel</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        )
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <Fragment key={item.href}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {item.isLast ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
