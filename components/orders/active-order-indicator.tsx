"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Activity, Play, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActiveOrder {
    id: string
    orderName: string
    projectId: string
    status: string
    project?: { name: string }
}

export function ActiveOrderIndicator({ orders }: { orders: any[] }) {
    
    if (!orders || orders.length === 0) return null

    const mainOrder = orders[0]

    return (
        <div className="ml-auto flex items-center gap-2">
            <Link 
                href={`/dashboard/projects/${mainOrder.projectId}`}
                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all duration-300"
            >
                {/* Animación de pulso */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>

                <div className="flex flex-col items-start leading-none gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-[-2px]">
                            {mainOrder.status === 'GENERANDO' ? 'Generando tareas...' : 'Orden Ejecutándose'}
                        </span>
                        <Zap className="h-2.5 w-2.5 text-primary fill-primary animate-pulse" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                        {mainOrder.orderName}
                    </span>
                </div>

                <div className="h-6 w-px bg-primary/20 mx-1 hidden sm:block" />
                
                <Badge variant="outline" className="hidden sm:flex h-5 border-primary/30 text-[9px] bg-background font-black uppercase tracking-tight px-1.5">
                    {orders.length > 1 ? `+${orders.length - 1} más` : 'Activa'}
                </Badge>
            </Link>
        </div>
    )
}
