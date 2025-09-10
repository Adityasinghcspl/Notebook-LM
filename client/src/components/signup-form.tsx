import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "./ui/password-input"
import { Link, useNavigate } from "react-router-dom"
import { signupSchema } from "@/lib/validationSchemas"
import { signup } from "@/lib/firebase"
import { toast } from "react-toastify"

type SignupValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupValues) {
    try {
      const userCredential = await signup(values.email, values.password)
      console.log("✅ User signed up:", userCredential.user)
      // show toast success
      toast.success("Signup successful! Please check your email for verification.")
      navigate("/signin")
    } catch (error: any) {
       toast.error(error.message || "Signup failed. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-muted-foreground text-balance">
                Signup with your email
              </p>
            </div>

            {/* Email */}
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput id="confirmPassword" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/auth/signin"
                className="underline underline-offset-4 cursor-pointer"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
