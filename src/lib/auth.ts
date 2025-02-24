import { prisma } from "@/lib/db"
import { deleteOTPCode, getOTPCodeByEmail, getUserByEmail, getUserById, LoginSchema } from "@/services/login-services"
import { updateOTPSessionTokenCheckExpiration } from "@/services/otpsession-services"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Role } from "@prisma/client"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const TOKEN_SESSION_EXPIRATION_IN_MINUTES = 15

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    // 7 días
    maxAge: 7 * 24 * 60 * 60
  },
  pages: {
    signIn: "/login",
  },
  providers: [    
    CredentialsProvider({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, code } = validatedFields.data
          const otpSessionId = (credentials as any).otpSessionId
          
          const user = await retryOnNeonSleep(() => getUserByEmail(email))
          
          if (!user || !user.email) return null

          const oTPCode = await retryOnNeonSleep(() => getOTPCodeByEmail(user.email))

          if (!oTPCode) {
            return null
          }
    
          if (oTPCode.code !== code) {
            return null
          }

          await retryOnNeonSleep(() => deleteOTPCode(oTPCode.id))

          // Guardar el otpSessionId en el token
          ;(user as any).otpSessionId = otpSessionId

          return user
        }

        return null
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role as Role,
          name: token.name,
          email: token.email as string,
          image: token.picture ?? null,
        };
      }

      return session;
    },
    async jwt({ token, user, trigger}) {
      //console.log("token", token)

      // const nodeEnv = process.env.NODE_ENV
      // if (nodeEnv === "development") {
      //   console.log("dev mode")
      //   return token
      // }
      
      if (!token.sub) return token

      // Capturar el otpSessionId del usuario cuando se inicia sesión
      if (user && (user as any).otpSessionId) {
        console.log("seteando otpSessionId", (user as any).otpSessionId)
        token.otpSessionId = (user as any).otpSessionId;
      }

      // Si no hay otpSessionId, la sesión no es válida
      if (!token.otpSessionId) {
        console.log("No hay otpSessionId, sesión no válida")
        // TODO: Implementar lógica de logout
        return token;
      }

      // Verificar si necesitamos actualizar la expiración
      const now = new Date();
      if (token.tokenCheckExpiration && trigger !== "update") {
        const expirationDate = new Date(token.tokenCheckExpiration);
        const diffInMinutes = (expirationDate.getTime() - now.getTime()) / (1000 * 60);
        
        // console.log("Tiempo restante de la sesión:", {
        //   expiration: expirationDate.toISOString(),
        //   now: now.toISOString(),
        //   minutosRestantes: diffInMinutes.toFixed(2)
        // });
        
        if (diffInMinutes > 0) {
          console.log("la sesión sigue vigente, faltan", diffInMinutes.toFixed(2), "minutos");
          
          return token;
        }
        console.log("la sesión expiró hace", Math.abs(diffInMinutes).toFixed(2), "minutos");
      } else {
        console.log("la sesión no tiene fecha de expiración");
      }

      // Si llegamos aquí, necesitamos actualizar
      const tokenCheckExpiration = new Date(now.getTime() + TOKEN_SESSION_EXPIRATION_IN_MINUTES * 60 * 1000);
      console.log("Actualizando sesión, nueva expiración en", TOKEN_SESSION_EXPIRATION_IN_MINUTES, "minutos");

      // Asegurarnos de que otpSessionId sea una cadena
      const otpSessionId = token.otpSessionId as string;

      // Actualizar la expiración de la sesión actual
      const res = await retryOnNeonSleep(() => updateOTPSessionTokenCheckExpiration(otpSessionId, tokenCheckExpiration));
      if (res) {
        console.log("actualizando tokenCheckExpiration", tokenCheckExpiration.toISOString())
        token.tokenCheckExpiration = tokenCheckExpiration.toISOString();                
      } else {
        console.log("No se encontró la sesión", token.otpSessionId);
        // Invalidar el token completamente
        return null;
      }

      const existingUser = await retryOnNeonSleep(() => getUserById(token.sub))      
      if (!existingUser) return token;

      // Siempre actualizamos los datos del usuario
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      if (existingUser.wineCritic) {
        token.wineCriticSlug = existingUser.wineCritic.slug;
        token.wineCriticName = existingUser.wineCritic.name;
      }
      if (existingUser.winery) {
        token.winerySlug = existingUser.winery.slug;
        token.wineryName = existingUser.winery.name;
      }
      token.picture = existingUser.image;

      return token;
    }
  }
})


async function retryOnNeonSleep(func: () => Promise<any>, retries = 1) {
  console.log("reintentando conexión a Neon", retries)
  try {
    return await func()
  } catch (error: any) {
    if (
      retries > 0 &&
      error.code === "57P01" // Código de error de Neon cuando está dormido
    ) {
      console.warn("Neon está despertando, reintentando...")
      return await retryOnNeonSleep(func, retries - 1)
    }
    throw error // Si no es un error de suspensión o no quedan reintentos, lanzar el error
  }
}