module.exports = [
"[project]/lib/actions/orders.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/* __next_internal_action_entry_do_not_use__ [{"007576319a2511124f44e8671f30b288ee53380a78":"getAllOrders","4007721cfd7b091e8376ff9babc797544d5c8a71a3":"getOrder","40094fb136cc23a728797f8e37f6b4a4d50719c755":"getNextOrderName","400d5b52b163870845ac99624ba39a61c3963b28af":"startOrder","405d216ed564ca9def4b613fa1bba26b94376e4ef5":"getOrders","40699c8371566d4864bc832cad5411d5aaec21b5ff":"createOrder","406f4e45d318e8d8192acd984e7729a07cda9a10eb":"pauseOrder","4095886a021c2640c94248f83fa3dee9f2a03f4a21":"getOrderWithComments","40ae09a0dd7ab8ea44cb47fb1085fc5ecba019fa01":"deleteOrder","40b96b0c04a7302ae889310938b974532236f403a6":"resumeOrder","40bfb1b53f27d4bfe94bb41cffdd8246cbd6bf748d":"updateOrder","40d0d7f35c0a57bffa5caa06f0dc64a20d35587e51":"getBreadcrumbData"},"",""] */ __turbopack_context__.s([
    "createOrder",
    ()=>createOrder,
    "deleteOrder",
    ()=>deleteOrder,
    "getAllOrders",
    ()=>getAllOrders,
    "getBreadcrumbData",
    ()=>getBreadcrumbData,
    "getNextOrderName",
    ()=>getNextOrderName,
    "getOrder",
    ()=>getOrder,
    "getOrderWithComments",
    ()=>getOrderWithComments,
    "getOrders",
    ()=>getOrders,
    "pauseOrder",
    ()=>pauseOrder,
    "resumeOrder",
    ()=>resumeOrder,
    "startOrder",
    ()=>startOrder,
    "updateOrder",
    ()=>updateOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
// Triggering reload for new enums
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function getOrders(projectId) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return [];
    }
    const orders = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findMany({
        where: {
            projectId,
            userId: session,
            deletedAt: null
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    genComments: true,
                    genLikes: true,
                    genShares: true,
                    genFollows: true,
                    genReports: true,
                    genLives: true
                }
            }
        }
    });
    return orders;
}
async function getAllOrders() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return [];
    }
    const orders = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findMany({
        where: {
            userId: session
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            project: {
                select: {
                    name: true,
                    id: true
                }
            },
            _count: {
                select: {
                    genComments: true,
                    genLikes: true,
                    genShares: true,
                    genFollows: true,
                    genReports: true,
                    genLives: true
                }
            }
        }
    });
    return orders;
}
async function getOrder(id) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return null;
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id,
            userId: session,
            deletedAt: null
        },
        include: {
            project: true,
            genComments: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genLikes: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genShares: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genFollows: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genReports: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genLives: {
                include: {
                    device: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });
    return order;
}
async function createOrder(input) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    // Verify project ownership
    const project = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].project.findFirst({
        where: {
            id: input.projectId,
            userId: session
        }
    });
    if (!project) {
        return {
            error: "Proyecto no encontrado"
        };
    }
    if (!input.link || input.link.length < 10) {
        return {
            error: "Ingresa un enlace válido"
        };
    }
    if (input.quantity < 1 || input.quantity > 500) {
        return {
            error: "La cantidad debe ser entre 1 y 500"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.create({
        data: {
            userId: session,
            projectId: input.projectId,
            type: input.type,
            url: input.link,
            socialNetwork: input.socialNetwork,
            postType: input.postType,
            orderName: input.orderName,
            intent: input.intent,
            quantity: input.quantity,
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].LISTA
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${input.projectId}`);
    return {
        success: true,
        order
    };
}
async function updateOrder(input) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id: input.id,
            userId: session,
            deletedAt: null
        }
    });
    if (!order) {
        return {
            error: "Orden no encontrada"
        };
    }
    if (order.status !== "LISTA") {
        return {
            error: "No se puede editar una orden que ya fue iniciada"
        };
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
        where: {
            id: input.id
        },
        data: {
            ...input.link && {
                url: input.link
            },
            ...input.socialNetwork && {
                socialNetwork: input.socialNetwork
            },
            ...input.postType && {
                postType: input.postType
            },
            ...input.intent && {
                intent: input.intent
            },
            ...input.quantity && {
                quantity: input.quantity
            },
            ...input.orderName && {
                orderName: input.orderName
            },
            ...input.type && {
                type: input.type
            }
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${order.projectId}`);
    return {
        success: true
    };
}
async function deleteOrder(id) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id,
            userId: session
        }
    });
    if (!order) {
        return {
            error: "Orden no encontrada"
        };
    }
    // Soft delete and mark as CANCELADA
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
        where: {
            id
        },
        data: {
            deletedAt: new globalThis.Date(),
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].CANCELADA
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${order.projectId}`);
    return {
        success: true
    };
}
const N8N_WEBHOOK_URL = "https://intelexia-labs-n8n.af9gwe.easypanel.host/webhook/run-orders-gen-comment";
async function startOrder(id) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id,
            userId: session
        },
        include: {
            project: {
                include: {
                    target: true
                }
            }
        }
    });
    if (!order) {
        return {
            error: "Orden no encontrada"
        };
    }
    if (order.type === __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderType"].COMENTARIO) {
        if (!order.project?.target) {
            return {
                error: "Se necesita crear un objetivo para enviar órdenes de comentarios.",
                code: "PROJECT_TARGET_REQUIRED",
                projectId: order.projectId
            };
        }
    }
    if (order.status !== "LISTA" && order.status !== "REINTENTAR" && order.status !== "CANCELADA" && order.status !== "PAUSADA") {
        return {
            error: "La orden ya fue iniciada o completada"
        };
    }
    // Actualizamos el estado a GENERANDO antes de disparar el webhook
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
        where: {
            id
        },
        data: {
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].GENERANDO
        }
    });
    try {
        const webhookPayload = {
            // Backwards-compatible identifier
            orderId: order.id,
            // Legacy top-level fields some n8n flows might rely on
            projectId: order.projectId,
            userId: order.userId,
            type: order.type,
            url: order.url,
            orderName: order.orderName,
            socialNetwork: order.socialNetwork,
            postType: order.postType,
            quantity: order.quantity,
            intent: order.intent || null,
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].GENERANDO,
            // Full order snapshot
            order: {
                id: order.id,
                projectId: order.projectId,
                userId: order.userId,
                type: order.type,
                url: order.url,
                orderName: order.orderName,
                socialNetwork: order.socialNetwork,
                postType: order.postType,
                intent: order.intent || null,
                quantity: order.quantity,
                status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].GENERANDO,
                sentAt: order.sentAt,
                generatedAt: order.generatedAt,
                deletedAt: order.deletedAt,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            },
            // Project snapshot
            project: order.project ? {
                id: order.project.id,
                name: order.project.name,
                nameLower: order.project.nameLower,
                userId: order.project.userId,
                targetId: order.project.targetId,
                stance: order.project.stance,
                createdAt: order.project.createdAt,
                updatedAt: order.project.updatedAt,
                deletedAt: order.project.deletedAt,
                target: order.project.target ? {
                    id: order.project.target.id,
                    name: order.project.target.name,
                    content: order.project.target.content,
                    imageBase64: order.project.target.imageBase64
                } : null
            } : null
        };
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: globalThis.JSON.stringify([
                webhookPayload
            ])
        });
        if (!response.ok) {
            // Si falla el webhook, volvemos a ponerlo en REINTENTAR para que el usuario sepa
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
                where: {
                    id
                },
                data: {
                    status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].REINTENTAR
                }
            });
            return {
                error: "Error al enviar la orden. El servidor respondió con error."
            };
        }
    } catch (error) {
        // Si hay error de red, volvemos a ponerlo en REINTENTAR
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
            where: {
                id
            },
            data: {
                status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].REINTENTAR
            }
        });
        return {
            error: "Error al enviar la orden. Intenta de nuevo."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${order.projectId}`);
    return {
        success: true
    };
}
async function getOrderWithComments(orderId) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autorizado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findUnique({
        where: {
            id: orderId,
            userId: session,
            deletedAt: null
        },
        include: {
            genComments: {
                include: {
                    device: {
                        select: {
                            deviceName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            genLives: {
                include: {
                    device: {
                        select: {
                            deviceName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            project: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    });
    return {
        order
    };
}
async function getNextOrderName(projectId) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) return "Orden #1";
    const count = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.count({
        where: {
            projectId,
            userId: session,
            deletedAt: null,
            status: {
                not: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].COMPLETADA
            }
        }
    });
    const nextCount = globalThis.Number(count) + 1;
    return `Orden #${nextCount}`;
}
async function getBreadcrumbData(orderId) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) return null;
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findUnique({
        where: {
            id: orderId,
            userId: session
        },
        select: {
            orderName: true,
            projectId: true,
            type: true,
            project: {
                select: {
                    name: true
                }
            }
        }
    });
    if (!order) return null;
    return {
        orderName: order.orderName || `Orden ${order.type}`,
        projectName: order.project.name,
        projectId: order.projectId
    };
}
async function pauseOrder(id) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id,
            userId: session
        }
    });
    if (!order) {
        return {
            error: "Orden no encontrada"
        };
    }
    if (order.status !== __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].GENERADA) {
        return {
            error: "Solo se pueden pausar órdenes que están en cola (GENERADA)"
        };
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
        where: {
            id
        },
        data: {
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].PAUSADA
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${order.projectId}`);
    return {
        success: true
    };
}
async function resumeOrder(id) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSession"])();
    if (!session) {
        return {
            error: "No autenticado"
        };
    }
    const order = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.findFirst({
        where: {
            id,
            userId: session
        }
    });
    if (!order) {
        return {
            error: "Orden no encontrada"
        };
    }
    if (order.status !== __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].PAUSADA) {
        return {
            error: "Solo se pueden reanudar órdenes que están pausadas"
        };
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].botOrder.update({
        where: {
            id
        },
        data: {
            status: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["OrderStatus"].GENERADA
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/dashboard/projects/${order.projectId}`);
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getOrders,
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    startOrder,
    getOrderWithComments,
    getNextOrderName,
    getBreadcrumbData,
    pauseOrder,
    resumeOrder
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getOrders, "405d216ed564ca9def4b613fa1bba26b94376e4ef5", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getAllOrders, "007576319a2511124f44e8671f30b288ee53380a78", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getOrder, "4007721cfd7b091e8376ff9babc797544d5c8a71a3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createOrder, "40699c8371566d4864bc832cad5411d5aaec21b5ff", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateOrder, "40bfb1b53f27d4bfe94bb41cffdd8246cbd6bf748d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteOrder, "40ae09a0dd7ab8ea44cb47fb1085fc5ecba019fa01", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(startOrder, "400d5b52b163870845ac99624ba39a61c3963b28af", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getOrderWithComments, "4095886a021c2640c94248f83fa3dee9f2a03f4a21", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getNextOrderName, "40094fb136cc23a728797f8e37f6b4a4d50719c755", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getBreadcrumbData, "40d0d7f35c0a57bffa5caa06f0dc64a20d35587e51", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(pauseOrder, "406f4e45d318e8d8192acd984e7729a07cda9a10eb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resumeOrder, "40b96b0c04a7302ae889310938b974532236f403a6", null);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/.next-internal/server/app/(dashboard)/dashboard/orders/[id]/executions/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/actions/user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/actions/projects.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/lib/actions/orders.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/projects.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/orders.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/.next-internal/server/app/(dashboard)/dashboard/orders/[id]/executions/page/actions.js { ACTIONS_MODULE0 => \"[project]/lib/actions/user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/lib/actions/projects.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/lib/actions/orders.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "0012900cf36cbe6454ad9312bd1fbfea942474aa16",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProjects"],
    "00697b4c847c79ee27ac04e96f3e2ef92969b80c69",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBlockedTargetIds"],
    "007576319a2511124f44e8671f30b288ee53380a78",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAllOrders"],
    "00ef3c20d55e0d73584da6f2fe689877b378d3068e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getCurrentUser"],
    "4007721cfd7b091e8376ff9babc797544d5c8a71a3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrder"],
    "40094fb136cc23a728797f8e37f6b4a4d50719c755",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNextOrderName"],
    "400d5b52b163870845ac99624ba39a61c3963b28af",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["startOrder"],
    "405d216ed564ca9def4b613fa1bba26b94376e4ef5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrders"],
    "40699c8371566d4864bc832cad5411d5aaec21b5ff",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createOrder"],
    "406f4e45d318e8d8192acd984e7729a07cda9a10eb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pauseOrder"],
    "407a787f895c9f06e7c930220a4772b4c658b4fa5e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTargetAction"],
    "4095886a021c2640c94248f83fa3dee9f2a03f4a21",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOrderWithComments"],
    "40ae09a0dd7ab8ea44cb47fb1085fc5ecba019fa01",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteOrder"],
    "40b96b0c04a7302ae889310938b974532236f403a6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resumeOrder"],
    "40bfb1b53f27d4bfe94bb41cffdd8246cbd6bf748d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateOrder"],
    "40c5240fefb03aff3c2d5437d4bb61517e208387b8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getTargetUsage"],
    "40d0d7f35c0a57bffa5caa06f0dc64a20d35587e51",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getBreadcrumbData"],
    "40d174e5f2f1a7ed5b6592266e67d174fd00049854",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteProject"],
    "40d676f8e042b62dfceea9c80481dc80ba3b21097f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getProject"],
    "605ee062686ca56e3b684a7f2a6ebb0d176907d3ce",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateProject"],
    "60c9d38760436d89d73ae245ac591eb587dcb768f7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateTargetAction"],
    "708f8adea5d6ca1ff70c9c83aa33cf4252e6c5b8eb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assignTargetToProject"],
    "70e89fa1f2ff2b54c8d4875abfeced6713fdaa5c22",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createProject"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$dashboard$292f$dashboard$2f$orders$2f5b$id$5d2f$executions$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(dashboard)/dashboard/orders/[id]/executions/page/actions.js { ACTIONS_MODULE0 => "[project]/lib/actions/user.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/lib/actions/projects.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/lib/actions/orders.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/projects.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/actions/orders.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$dashboard$292f$dashboard$2f$orders$2f5b$id$5d2f$executions$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$dashboard$292f$dashboard$2f$orders$2f5b$id$5d2f$executions$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$projects$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$actions$2f$orders$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_7e02cf98._.js.map