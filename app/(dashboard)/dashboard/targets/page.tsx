import { Suspense } from "react"
import { getUserTargets } from "@/lib/actions/targets"
import { TargetFormDialog } from "@/components/targets/target-form-dialog"
import { TargetCard } from "@/components/targets/target-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"

export default async function TargetsPage() {
    const targets = await getUserTargets()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Biblioteca de Objetivos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los perfiles de marca o personales que usarán tus bots.
                    </p>
                </div>
                <TargetFormDialog
                    trigger={
                        <Button>
                            <Target className="mr-2 h-4 w-4" />
                            Crear Nuevo Objetivo
                        </Button>
                    }
                    mode="create"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {targets.length === 0 ? (
                    <Card className="col-span-full border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                        <div className="flex flex-col items-center gap-2">
                            <Target className="h-10 w-10 opacity-50" />
                            <h3 className="text-lg font-medium">No tienes objetivos creados</h3>
                            <p className="text-sm max-w-sm">Crea tu primer objetivo para luego asignarlo a tus proyectos y definir su personalidad.</p>
                        </div>
                    </Card>
                ) : (
                    targets.map((target: any) => (
                        <TargetCard key={target.id} target={target} />
                    ))
                )}
            </div>
        </div>
    )
}
