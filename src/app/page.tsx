import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/utils";
import Link from "next/link";
import { logoutAction } from "./(auth)/login/actions";
import { LogoutButtonForButton } from "@/components/layout/logout-button";

export default async function Home() {
  const user = await getCurrentUser()
  return (
      <main className="mt-10 lg:mt-40 w-full flex justify-center">
      {
          user ? (
            <div className="space-y-10">
              <h1>Bienvenido, {user.name || user.email}</h1>

              <div>
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button className="w-full">Admin</Button>
                </Link>
              )}
              </div>
              <LogoutButtonForButton redirectTo="/" label="Cerrar sesión" />
            </div>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )
        }


      </main>
  );
}
