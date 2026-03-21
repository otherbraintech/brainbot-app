"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, Sparkles } from "lucide-react"
import changelogData from "@/config/changelog.json"
import packageJson from "@/package.json"

export function ChangelogDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const currentVersion = packageJson.version
  
  useEffect(() => {
    const cookies = document.cookie.split('; ')
    const lastSeenVersionCookie = cookies.find(row => row.startsWith('last_seen_version='))?.split('=')[1]
    
    if (lastSeenVersionCookie !== currentVersion) {
      setIsOpen(true)
    }
  }, [currentVersion])

  const handleClose = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    document.cookie = `last_seen_version=${currentVersion}; expires=${date.toUTCString()}; path=/`
    setIsOpen(false)
  }

  const latestUpdate = changelogData.versions[0]

  if (!latestUpdate) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose()
    }}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-hidden p-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="bg-primary/5 p-8 pb-6 border-b">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Sparkles className="h-6 w-6" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">¡Nueva Actualización!</DialogTitle>
                <DialogDescription className="text-sm font-medium opacity-70">
                  Explora las novedades de la versión {currentVersion}
                </DialogDescription>
             </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            Publicado el {latestUpdate.date}
          </Badge>
        </div>

        <div className="p-8 py-6">
          <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-slate-100 italic underline underline-offset-4 decoration-primary/30">
            {latestUpdate.title}
          </h3>
          <ScrollArea className="h-[250px] pr-4">
            <ul className="space-y-4">
              {latestUpdate.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-3 group animate-in fade-in slide-in-from-left-4 duration-500 ease-out fill-mode-both" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    {change}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 pt-0 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
          <Button 
            className="w-full sm:w-auto font-bold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all active:scale-[0.98]" 
            onClick={handleClose}
          >
            ¡Entendido!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
