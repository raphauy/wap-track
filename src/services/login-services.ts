import { DeviceInfo } from "@/app/(auth)/login/actions";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db"
import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required",
    }),
    code: z.optional(z.string()),
});
  

/**
 * 
 * OTPCode functions
 *  
 */

export async function generateOTPCode(email: string) {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000);
  
    const existingToken = await getOTPCodeByEmail(email)
  
    if (existingToken) {
      await deleteOTPCode(existingToken.id)
    }
  
    const oTPCode = await createOTPCode(email, token, expires)
  
    return oTPCode
}

// DB OTPCode functions

export async function getOTPCodeByEmail(email: string) {
    const oTPCode = await prisma.oTPCode.findFirst({
        where: { 
            email 
        }
    })

    return oTPCode
}

export async function createOTPCode(email: string, code: string, expires: Date) {
    const oTPCode = await prisma.oTPCode.create({
        data: {
            email,
            code,
            expires
        }
    })

    return oTPCode
}

export async function deleteOTPCode(id: string) {
    const oTPCode = await prisma.oTPCode.delete({
        where: {
            id
        }
    })

    return oTPCode
}

/**
 * User functions
 */
export async function setUserAsVerified(userId: string) {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            emailVerified: new Date(),
        }
    })

    return user
}

export const getUserByEmail = async (email: string) => {
    try {
        console.log("getUserByEmail", email)
        
        const user = await prisma.user.findUnique({ where: { email } })

        console.log("user", user)
        

        return user
    } catch {
        return null
    }
};
  
  export const getUserById = async (id: string) => {
    try {
        console.log("getUserById", id)
        
        const user = await prisma.user.findUnique({ 
            where: { 
                id 
            },
        })

        return user
    } catch {
        return null
    }
};

export async function logout() {
    const session = await auth()
    if (session) {
        await signOut()
    }
}


