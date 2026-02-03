import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    
    if (!session) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    
    const { id } = await params
    
    const project = await prisma.project.findFirst({
        where: { id, userId: session },
        select: { name: true },
    })
    
    if (!project) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }
    
    return NextResponse.json({ name: project.name })
}
