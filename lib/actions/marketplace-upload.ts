"use server"

import { getSession } from "@/lib/auth"

const UPLOAD_URL = "https://otherbrain-tech-ob-files-oficial.ddt6vc.easypanel.host/api/upload"

export async function uploadMarketplaceImage(
  base64Data: string,
  filename: string,
  mimeType: string
) {
  const session = await getSession()
  
  if (!session) {
    return { error: "No autenticado" }
  }

  // The user added NEXT_PUBLIC_IMAGE_MANAGER_URL to the env as the token
  const token = process.env.NEXT_PUBLIC_IMAGE_MANAGER_URL

  if (!token) {
    return { error: "Falta el token de configuración del gestor de imágenes" }
  }

  try {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token_project: token,
        filename,
        file: base64Data, // This should be just the base64 part, not the prefix like data:image/png;base64,
        mimeType,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error from upload service:", errorText)
      return { error: "Error al subir la imagen al servidor externo" }
    }

    const data = await response.json()
    
    // Confirmed response format: { success: true, id: "...", url: "...", ... }
    if (data && data.success && data.url) {
      return { 
        success: true,
        url: data.url,
        id: data.id 
      }
    } else {
      console.error("Unexpected response from upload service:", data)
      return { error: data.message || "Error en la respuesta del servicio de imágenes" }
    }
  } catch (error) {
    console.error("Exception during image upload:", error)
    return { error: "Fallo de conexión con el servicio de imágenes" }
  }
}
