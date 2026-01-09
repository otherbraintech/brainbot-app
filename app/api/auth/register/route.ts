import { createSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(2),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parseResult = registerSchema.safeParse(body)
    
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      let message = "Datos inválidos"
      
      if (firstError.path[0] === "username") {
        message = "El nombre de usuario debe tener al menos 3 caracteres"
      } else if (firstError.path[0] === "name") {
        message = "El nombre debe tener al menos 2 caracteres"
      } else if (firstError.path[0] === "password") {
        message = "La contraseña debe tener al menos 6 caracteres"
      }
      
      return NextResponse.json({ error: message }, { status: 400 })
    }
    
    const { username, name, password } = parseResult.data

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { usernameLower: username.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El nombre de usuario ya existe" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        usernameLower: username.toLowerCase(),
        name,
        passwordHash,
        role: "USUARIO",
      },
    })

    await createSession(user.id)

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    )
  }
}
