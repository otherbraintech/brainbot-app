"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
    const session = await getSession()
    if (!session) return null

    const user = await prisma.user.findUnique({
        where: { id: session },
        select: { role: true }
    })

    if (!user) return null

    const isAdmin = user.role === "ADMIN"

    // Base query filter
    const baseFilter = isAdmin ? {} : { userId: session }
    const orderFilter = { ...baseFilter, deletedAt: null }

    // 1. Totals
    const [
        totalUsers,
        totalProjects,
        totalOrders,
        totalDevices,
        totalComments,
        totalLikes,
        totalFollows
    ] = await Promise.all([
        prisma.user.count(),
        prisma.project.count({ where: { ...baseFilter, deletedAt: null } }),
        prisma.botOrder.count({ where: orderFilter }),
        prisma.device.count(), // Devices are global
        prisma.genComment.count({ where: baseFilter }),
        prisma.genLike.count({ where: { userId: session } }), // GenLike has userId but GenLike table might be mostly for the order's user
        prisma.genFollow.count({ where: { userId: session } })
    ])

    // 2. Orders by Status
    const ordersByStatus = await prisma.botOrder.groupBy({
        by: ['status'],
        where: orderFilter,
        _count: true
    })

    // 3. Orders by Social Network
    const socialDistribution = await prisma.botOrder.groupBy({
        by: ['socialNetwork'],
        where: orderFilter,
        _count: true
    })

    // 4. Device Status Distribution
    const deviceStatus = await prisma.device.groupBy({
        by: ['status'],
        _count: true
    })

    // 5. Recent Activity (Last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentOrders = await prisma.botOrder.findMany({
        where: {
            ...orderFilter,
            createdAt: { gte: sevenDaysAgo }
        },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
    })

    // Grouping recent orders by day for a chart
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        return {
            date: d.toISOString().split('T')[0],
            count: 0
        }
    }).reverse()

    recentOrders.forEach(order => {
        const day = order.createdAt.toISOString().split('T')[0]
        const entry = dailyActivity.find(a => a.date === day)
        if (entry) entry.count++
    })

    // 6. Top Projects (by order count)
    const topProjectsRaw = await prisma.botOrder.groupBy({
        by: ['projectId'],
        where: orderFilter,
        _count: true,
        orderBy: {
            _count: {
                projectId: 'desc'
            }
        },
        take: 5
    })

    const topProjects = await Promise.all(topProjectsRaw.map(async (p) => {
        const project = await prisma.project.findUnique({
            where: { id: p.projectId },
            select: { name: true }
        })
        return {
            name: project?.name || 'Desconocido',
            count: p._count
        }
    }))

    // 7. Recent Integration Logs
    const recentLogs = await prisma.integrationLog.findMany({
        where: isAdmin ? {} : { userId: session },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            project: { select: { name: true } },
            botOrder: { select: { orderName: true, type: true } }
        }
    })

    // 8. Users by Plan (Admin only)
    let usersByPlan: any[] = []
    if (isAdmin) {
        usersByPlan = await prisma.user.groupBy({
            by: ['plan'],
            _count: true
        } as any)
    }

    // 9. Recent Devices (Active)
    const recentDevices = await prisma.device.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5
    })

    return {
        totals: {
            users: totalUsers,
            projects: totalProjects,
            orders: totalOrders,
            devices: totalDevices,
            comments: totalComments,
            likes: totalLikes,
            follows: totalFollows,
            engagement: totalComments + totalLikes + totalFollows
        },
        ordersByStatus,
        socialDistribution,
        deviceStatus,
        dailyActivity,
        topProjects,
        recentLogs,
        recentDevices,
        usersByPlan,
        isAdmin
    }
}
