"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { sendOTP } from "@/services/email-services";
import { LoginSchema, generateOTPCode, getOTPCodeByEmail, getUserByEmail, setUserAsVerified } from "@/services/login-services";
import { createOTPSession } from "@/services/otpsession-services";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import * as z from "zod";

export type DeviceInfo = {
	deviceBrowser: string | undefined
	deviceOs: string | undefined
	ipAddress: string | undefined
	city: string | undefined
	country: string | undefined
}

export async function loginAction(values: z.infer<typeof LoginSchema>, callbackUrl?: string, deviceInfo?: DeviceInfo) {
  
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email) {
    return { error: "No existe un usuario con este email!" };
  }

  if (existingUser.email) {
    if (code) {
      const oTPCode = await getOTPCodeByEmail(existingUser.email)

      if (!oTPCode) {
        return { error: "Código no encontrado!" }
      }

      if (oTPCode.code !== code) {
        return { error: "Código equivocado!" }
      }

      const hasExpired = new Date(oTPCode.expires) < new Date()

      if (hasExpired) {
        return { error: "Código expirado!" }
      }

      await setUserAsVerified(existingUser.id)

      // await deleteOTPCode(oTPCode.id)

      const otpSession = await createOTPSession({
        userId: existingUser.id,
        deviceBrowser: deviceInfo?.deviceBrowser,
        deviceOs: deviceInfo?.deviceOs,
        ipAddress: deviceInfo?.ipAddress,
        city: deviceInfo?.city,
        country: deviceInfo?.country
      })

      revalidatePath("/admin/otpsessions")

      try {
        console.log("credentials", { email, code, otpSessionId: otpSession.id });
        
        const ok = await signIn("credentials", {
          email,
          code,
          otpSessionId: otpSession.id,
          redirect: false
        })

        if (ok && !ok.error) {
          console.log("user logged in")
          const session= await auth()
          console.log("session", session)
        } else {
          return { error: ok?.error || "Algo salió mal!" };
        }

      } catch (error) {
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              return { error: "Credenciales inválidas!" }
            default:
              return { error: "Algo salió mal!" }
          }
        }

        throw error;
      }
    } else {
      const oTPCode = await generateOTPCode(existingUser.email)
      const isProduction= process.env.NODE_ENV === "production"
      if (isProduction) {
        await sendOTP(existingUser.email, oTPCode.code)
      } else {
        console.log("email", oTPCode.email)        
        console.log("code", oTPCode.code)
      }

      return { code: true, success: "Te enviamos un código de acceso!" };
    }
  }
};

export async function logoutAction() {
  console.log("logout")
  await signOut({ redirectTo: "/" })
}
