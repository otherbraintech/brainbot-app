"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        window.location.href = "/dashboard"
      } else {
        setError(result.error || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesión en tu cuenta</CardTitle>
          <CardDescription>
            Ingresa tu nombre de usuario para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="juan123"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                </div>
                <Input id="password" name="password" type="password" placeholder="*********" required />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                <FieldDescription className="text-center">
                  ¿No tienes una cuenta? <a href="/register" className="underline">Regístrate</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
