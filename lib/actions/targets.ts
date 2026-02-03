"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserTargets() {
  const session = await getSession()
  
  if (!session) {
    return []
  }
  
  const targets = await prisma.target.findMany({
    where: { 
      userId: session,
    },
    orderBy: { createdAt: "desc" },
  })
  
  return targets
}

export async function createTargetWithWebhook(payload: any) {
    const session = await getSession()
    
    if (!session) {
        return { error: "No autenticado" }
    }

    const WEBHOOK_URL = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/creation_target"

    try {
        // 1. Send to Webhook (Simulation/Real)
        // The webhook expects an array, we add user_id for identification
        const webhookBody = [{
            ...payload.target_input,
            user_id: session
        }]
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookBody),
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        const responseData = await response.json()

        if (!responseData.estado && responseData.code !== 200) {
            return { error: responseData.Message || "Error en el servidor de n8n" }
        }

        // 2. Create Target in DB
        // Support both old flat structure and new nested structure during transition
        const targetData = payload.target_input.target?.[0] || payload.target_input
        const identityName = targetData.basic_identity?.name || "Sin Nombre"
        const role = targetData.basic_identity?.role || ""
        const displayName = role ? `${identityName} - ${role}` : identityName

        const newTarget = await prisma.target.create({
            data: {
                userId: session,
                name: displayName,
                content: payload.target_input,
                imageBase64: payload.imageBase64 || null
            }
        })

        revalidatePath("/dashboard/projects")
        revalidatePath("/dashboard/targets")
        return { success: true, target: newTarget, message: responseData.Message }
    } catch (error: any) {
        console.error("Error in createTargetWithWebhook:", error)
        if (error.name === 'AbortError') {
            return { error: "El servidor tardó demasiado en responder (Timeout). Intenta de nuevo." }
        }
        return { error: "Error de conexión o del servidor al crear el objetivo." }
    }
}

export async function updateTarget(targetId: string, data: any) {
  const session = await getSession()
  if (!session) return { error: "No autorizado" }

  try {
    const target = await prisma.target.findFirst({ where: { id: targetId, userId: session } })
    if (!target) return { error: "Objetivo no encontrado" }

    const { imageBase64, ...contentData } = data
    await prisma.target.update({
      where: { id: targetId },
      data: { 
          content: contentData,
          imageBase64: imageBase64 || undefined
      }
    })
    
    revalidatePath("/dashboard/projects")
    revalidatePath("/dashboard/targets")
    return { success: true }
  } catch (error) {
    console.error("Error in updateTarget:", error)
    return { error: "Error al actualizar el objetivo" }
  }
}
