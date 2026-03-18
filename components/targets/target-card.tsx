"use client"

import { useState } from "react"
import { Target, Briefcase, MapPin, Eye, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TargetFormDialog } from "@/components/targets/target-form-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface TargetCardProps {
    target: any
}

export function TargetCard({ target }: TargetCardProps) {
    const [showPreview, setShowPreview] = useState(false)

    // New structure has target array, old has fields directly in content
    const data = target.content.target?.[0] || target.content
    const identity = data.basic_identity || {}
    const context = data.contextual_identity || {}
    const imageSource = target.imageBase64 || identity.profile_image || identity.image || null

    return (
        <>
            <Card className="relative overflow-hidden group flex flex-col h-full">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50 ${imageSource ? 'cursor-pointer ring-offset-background transition-all hover:ring-2 hover:ring-primary/40 hover:ring-offset-1' : ''}`}
                                    onClick={() => imageSource && setShowPreview(true)}
                                >
                                    {imageSource ? (
                                        <img
                                            src={imageSource}
                                            alt={identity.name || "Target"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Target className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                                <CardTitle className="text-lg leading-tight truncate">
                                    {identity.name || "Sin Nombre"}
                                </CardTitle>
                            </div>
                            <CardDescription className="flex items-center gap-1 text-xs pl-1">
                                <Briefcase className="h-3 w-3" /> {identity.role || "Sin rol"}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase">
                            {data.target_type === 'COMPANY' ? 'Empresa' : (data.target_type === 'PERSON' ? 'Persona' : 'Gen\u00e9rico')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm flex-1">
                    {context.self_description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 italic">
                            &quot;{context.self_description}&quot;
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                        {identity.location?.city && (
                            <Badge variant="secondary" className="gap-1 text-[10px] bg-zinc-100 dark:bg-zinc-900/50">
                                <MapPin className="h-3 w-3" /> {identity.location.city}
                            </Badge>
                        )}
                    </div>
                </CardContent>

                <div className="px-6 py-4 border-t bg-muted/30 mt-auto grid grid-cols-2 gap-3">
                    <TargetFormDialog
                        initialData={target}
                        mode="view"
                        trigger={
                            <Button size="sm" variant="outline" className="w-full gap-2 bg-background border-border shadow-xs">
                                <Eye className="h-3.5 w-3.5" />
                                Ver Perfil
                            </Button>
                        }
                    />
                    <TargetFormDialog
                        initialData={target}
                        mode="edit"
                        trigger={
                            <Button size="sm" variant="outline" className="w-full gap-2 border-border shadow-xs">
                                <Edit className="h-3.5 w-3.5" />
                                Editar
                            </Button>
                        }
                    />
                </div>
            </Card>

            {/* Image Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="sm:max-w-lg flex flex-col items-center gap-4 p-8">
                    <DialogHeader className="text-center w-full">
                        <DialogTitle className="text-xl font-bold">{identity.name || "Objetivo"}</DialogTitle>
                        <DialogDescription>{identity.role || ""}</DialogDescription>
                    </DialogHeader>
                    {imageSource && (
                        <div className="w-80 h-80 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
                            <img
                                src={imageSource}
                                alt={identity.name || "Target"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
