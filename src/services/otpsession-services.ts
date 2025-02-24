import { prisma } from "@/lib/db"
import * as z from "zod"
import { UserDAO } from "./user-services"
import { revalidatePath } from "next/cache"

export type OTPSessionDAO = {
	id: string
  tokenCheckExpiration: Date | null
	deviceBrowser: string | null
	deviceOs: string | null
	ipAddress: string | null
	city: string | null
	country: string | null
	createdAt: Date
	updatedAt: Date
	userId: string
	user: UserDAO
}

export const oTPSessionSchema = z.object({
	deviceBrowser: z.string().optional(),
	deviceOs: z.string().optional(),
	ipAddress: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	userId: z.string().min(1, "userId is required."),
})

export type OTPSessionFormValues = z.infer<typeof oTPSessionSchema>


export async function getOTPSessionsDAO() {
  const found = await prisma.oTPSession.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as OTPSessionDAO[]
}

export async function getOTPSessionDAO(id: string) {
  const found = await prisma.oTPSession.findUnique({
    where: {
      id
    },
  })
  return found as OTPSessionDAO
}
    
export async function createOTPSession(data: OTPSessionFormValues) {
  // TODO: implement createOTPSession
  const created = await prisma.oTPSession.create({
    data
  })
  return created
}

export async function updateOTPSession(id: string, data: OTPSessionFormValues) {
  const updated = await prisma.oTPSession.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteOTPSession(id: string) {
  const deleted = await prisma.oTPSession.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullOTPSessionsDAO() {
  const found = await prisma.oTPSession.findMany({
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
			user: true,
		}
  })
  return found as OTPSessionDAO[]
}
  
export async function getFullOTPSessionDAO(id: string) {
  const found = await prisma.oTPSession.findUnique({
    where: {
      id
    },
    include: {
			user: true,
		}
  })
  return found as OTPSessionDAO
}
    
export async function updateOTPSessionTokenCheckExpiration(otpSessionId: string, tokenCheckExpiration: Date) {
  // check if otpSessionId exists
  const otpSession = await prisma.oTPSession.findUnique({
    where: {
      id: otpSessionId
    }
  })
  if (!otpSession) return null

  try {
    const updated = await prisma.oTPSession.update({
      where: {
        id: otpSessionId
      },
      data: { tokenCheckExpiration }
    })
    return updated
  } catch (error) {
    console.log("Error actualizando tokenCheckExpiration")
    return null
  }
}

export async function getLastOTPSession(userId: string): Promise<OTPSessionDAO | null> {
  return await prisma.oTPSession.findFirst({
    where: {
      userId,
      tokenCheckExpiration: {
        not: null
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: true
    }
  });
}

export async function revalidateOTPSessions() {
  revalidatePath("/admin/otpsessions")
}