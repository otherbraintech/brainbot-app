"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function RedirectToActiveProject() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const allowList = searchParams.get("list")
        if (allowList === "1") return

        try {
            const saved = localStorage.getItem("active_project")
            if (!saved) return

            const parsed = JSON.parse(saved)
            const id = parsed?.id
            if (!id || typeof id !== "string") return

            router.replace(`/dashboard/projects/${id}`)
        } catch {
            // ignore
        }
    }, [router, searchParams])

    return null
}
