"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { pdf } from '@react-pdf/renderer'
import { OrderPDFTemplate } from "@/lib/pdf/order-pdf-template"
import { getOrderForPDF } from "@/lib/actions/pdf-actions"
import { toast } from "sonner"
import { useEffect } from 'react'

interface DownloadPDFButtonProps {
  orderId: string
  orderName: string
}

export function DownloadPDFButton({ orderId, orderName }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-7 w-7 flex items-center justify-center">
        <div className="h-3.5 w-3.5" />
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      setLoading(true)
      
      // Fetch full data needed for PDF
      const fullOrder = await getOrderForPDF(orderId)
      
      if (!fullOrder) {
        toast.error("No se pudo obtener la información de la orden")
        return
      }

      // Combine comments and lives if necessary, or just use what we have
      const comments = [
        ...(fullOrder.genComments || []),
        ...(fullOrder.genLives || [])
      ]

      // Generate PDF blob
      const blob = await pdf(
        <OrderPDFTemplate 
          order={fullOrder} 
          project={fullOrder.project} 
          comments={comments} 
        />
      ).toBlob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orden-${orderName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("PDF descargado correctamente")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Error al generar el PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-7 w-7" 
      onClick={handleDownload}
      disabled={loading}
      title="Descargar PDF"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <FileDown className="h-3.5 w-3.5 text-blue-500" />
      )}
    </Button>
  )
}
