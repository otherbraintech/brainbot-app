import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import {
  CommentStatus,
  DeviceStatus,
  OrderStatus,
  Plan,
  PostType,
  PrismaClient,
  Role,
} from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = "demo";
  const usernameLower = username.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { usernameLower },
    select: { id: true },
  });

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        username,
        usernameLower,
        passwordHash: "dev-only-not-hashed",
        name: "Usuario Demo",
        role: Role.USUARIO,
        plan: Plan.GRATIS,
        commentLimit: 500,
        commentsUsed: 0,
      },
      select: { id: true },
    }));

  const projectName = "torta";
  const projectNameLower = projectName.toLowerCase();

  const project = await prisma.project.upsert({
    where: {
      userId_nameLower: {
        userId: user.id,
        nameLower: projectNameLower,
      },
    },
    update: {
      name: projectName,
    },
    create: {
      userId: user.id,
      name: projectName,
      nameLower: projectNameLower,
    },
    select: { id: true },
  });

  // Crear dispositivos de ejemplo
  const devicesData = [
    {
      deviceName: "iPhone 15 Pro",
      personName: "Juan Pérez",
      urlTiktok: "https://tiktok.com/@juanperez",
      urlInstagram: "https://instagram.com/juanperez",
      status: DeviceStatus.LIBRE,
    },
    {
      deviceName: "Samsung Galaxy S24",
      personName: "María García",
      urlFacebook: "https://facebook.com/mariagarcia",
      urlInstagram: "https://instagram.com/mariagarcia",
      status: DeviceStatus.LIBRE,
    },
    {
      deviceName: "Xiaomi 14",
      personName: null,
      status: DeviceStatus.BLOQUEADO,
      blockedAt: new Date(),
    },
  ];

  const devices = [];
  for (const deviceData of devicesData) {
    const device = await prisma.device.upsert({
      where: { id: deviceData.deviceName }, // Usamos upsert con un campo que no existe para forzar create
      update: {},
      create: deviceData,
    });
    devices.push(device);
  }

  const order = await prisma.generationOrder.create({
    data: {
      userId: user.id,
      projectId: project.id,
      link: "https://instagram.com/p/FAKE_TORTA_POST",
      socialNetwork: "INSTAGRAM",
      postType: PostType.IMAGEN,
      intent:
        "Comentarios positivos y naturales para una pastelería, tono cercano, menciona lo delicioso y la presentación.",
      quantity: 5,
      status: OrderStatus.LISTA,
      sentAt: new Date(),
    },
    select: { id: true },
  });

  const comments = [
    "Qué buena pinta tiene esa torta, se ve súper esponjosa.",
    "La decoración está hermosa, dan ganas de probarla ya.",
    "Se nota la calidad, perfecta para un cumpleaños.",
    "Qué delicia, ¿hacen envíos a domicilio?",
    "La presentación está 10/10, felicitaciones.",
  ];

  await prisma.botComment.createMany({
    data: comments.map((text, index) => ({
      userId: user.id,
      projectId: project.id,
      orderId: order.id,
      text,
      deviceId: devices[index % devices.length]?.id, // Asignar dispositivo rotando
      status: CommentStatus.PENDIENTE,
    })),
  });

  await prisma.integrationLog.create({
    data: {
      source: "N8N",
      eventType: "COMMENTS_PERSISTED",
      userId: user.id,
      projectId: project.id,
      orderId: order.id,
      payload: {
        example: true,
        note: "Seed ficticio: simulación de comentarios generados por n8n.",
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      commentsUsed: comments.length,
    },
  });

  await prisma.generationOrder.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.GENERADA,
      generatedAt: new Date(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
