"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { DeviceStatus } from "@prisma/client"

export async function getDevices() {
  const devices = await prisma.device.findMany({
    orderBy: { deviceName: "asc" },
    select: {
      id: true,
      deviceName: true,
      personName: true,
      status: true,
      urlTiktok: true,
      urlFacebook: true,
      urlInstagram: true,
      blockedAt: true,
      createdAt: true,
    },
  })
  
  return devices
}

export async function getDevice(id: string) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      _count: {
        select: { 
          genComments: true,
          genLikes: true,
          genShares: true,
          genFollows: true,
          genReports: true,
        },
      },
    },
  })
  
  return device
}

type CreateDeviceInput = {
  deviceName: string
  personName?: string
  urlTiktok?: string
  urlFacebook?: string
  urlInstagram?: string
}

export async function createDevice(input: CreateDeviceInput) {
  const device = await prisma.device.create({
    data: {
      deviceName: input.deviceName,
      personName: input.personName || null,
      urlTiktok: input.urlTiktok || null,
      urlFacebook: input.urlFacebook || null,
      urlInstagram: input.urlInstagram || null,
      status: "LIBRE",
    } as any,
  })
  
  revalidatePath("/dashboard/devices")
  return { success: true, device }
}

type UpdateDeviceInput = {
  id: string
  deviceName?: string
  personName?: string
  urlTiktok?: string
  urlFacebook?: string
  urlInstagram?: string
  status?: DeviceStatus
}

export async function updateDevice(input: UpdateDeviceInput) {
  const device = await prisma.device.update({
    where: { id: input.id },
    data: {
      ...(input.deviceName && { deviceName: input.deviceName }),
      personName: input.personName || null,
      urlTiktok: input.urlTiktok || null,
      urlFacebook: input.urlFacebook || null,
      urlInstagram: input.urlInstagram || null,
      ...(input.status && { status: input.status }),
      ...(input.status === "BLOQUEADO" && { blockedAt: new Date() }),
      ...(input.status !== "BLOQUEADO" && { blockedAt: null }),
    } as any,
  })
  
  revalidatePath("/dashboard/devices")
  return { success: true, device }
}

export async function deleteDevice(id: string) {
  await prisma.device.delete({
    where: { id },
  })
  
  revalidatePath("/dashboard/devices")
  return { success: true }
}

export async function getAvailableDevicesCount() {
  const count = await prisma.device.count({
    where: { status: "LIBRE" }
  })
  
  return count
}
