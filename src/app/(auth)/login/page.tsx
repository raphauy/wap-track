import { getCurrentUser } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    email?: string
  }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { email } = await searchParams;

  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="w-full h-full flex items-center justify-center pb-32">
      <LoginForm requestedEmail={email} />
    </div>
  );
}
