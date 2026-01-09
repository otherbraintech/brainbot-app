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
import { Fragment } from "react"

const ROUTE_LABELS: Record<string, string> = {
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
    const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})

    // Fetch dynamic data for IDs in the path
    useEffect(() => {
        async function fetchDynamicLabels() {
            const segments = pathname.split("/").filter(Boolean)
            const projectIndex = segments.indexOf("projects")

            // If there's a project ID after "projects"
            if (projectIndex !== -1 && segments[projectIndex + 1]) {
                const projectId = segments[projectIndex + 1]
                // Only fetch if it looks like an ID
                if (projectId.startsWith("cm") || projectId.includes("-")) {
                    try {
                        const res = await fetch(`/api/projects/${projectId}/name`)
                        if (res.ok) {
                            const data = await res.json()
                            setDynamicLabels(prev => ({ ...prev, [projectId]: data.name }))
                        }
                    } catch {
                        // Ignore errors
                    }
                }
            }
        }
        fetchDynamicLabels()
    }, [pathname])

    // Split path and filter empty segments
    const segments = pathname.split("/").filter(Boolean)

    // Build breadcrumb items
    const breadcrumbItems: BreadcrumbItemData[] = []

    let currentPath = ""
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
