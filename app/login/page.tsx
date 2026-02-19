import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthSessionHandler } from "@/components/auth/session-handler"

export const metadata = {
  title: "Log in - Portlify",
  description: "Log in to your Portlify account",
}

export default function LoginPage() {
  return (
    <>
      <AuthSessionHandler />
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-6 py-12">
          <div className="mx-auto w-full max-w-sm">
            <Link href="/" className="mb-12 inline-block text-xl font-bold tracking-tight text-foreground">
              portlify
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your account.
            </p>
            <div className="mt-8">
              <AuthForm mode="login" />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center bg-foreground lg:flex">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
              Build portfolios that get you hired.
            </h2>
            <p className="mt-4 text-primary-foreground/60">
              Join thousands of developers showcasing their best work.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
