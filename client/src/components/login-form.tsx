import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-toastify"
import { forgotPasswordSchema } from "@/lib/validationSchemas"
import { setUser } from "@/redux/features/slice/userSlice"
import { useDispatch } from "react-redux"
import { PasswordInput } from "./ui/password-input"

// ---------------- Validation Schemas ----------------
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

// ---------------- Component ----------------
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch();


  // ---------------- Google Login ----------------
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = {
        providerData: result.user.providerData,
        accessToken: (result.user as any).stsTokenManager?.accessToken || null
      };
      // Set user in app state (React state or Redux)
      dispatch(setUser(userData));
      toast.success(`Welcome ${result.user.displayName || "User"} 👋`);
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        if (email) {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          toast.error(`This email is already registered with: ${methods[0]}`);
        }
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.warning("Login popup closed before completing");
      } else {
        toast.error("Google login failed ❌");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- React Hook Form ----------------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  // ---------------- Login with Email/Password ----------------
  const onLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userData = {
        providerData: result.user.providerData,
        accessToken: (result.user as any).stsTokenManager?.accessToken || null
      };
      // Set user in app state (React state or Redux)
      dispatch(setUser(userData));
      toast.success("Login successful 🎉");
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        toast.error("This email is already registered with Google. Please login using Google.");
      } else {
        toast.error(error.message || "Login failed ❌");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Forgot Password Form ----------------
  const onForgotPassword = async (values: ForgotPasswordValues) => {
    try {
      await sendPasswordResetEmail(auth, values.email)
      toast.success("Password reset link sent to your email 📩")
      setIsForgotPassword(false) // go back to login after success
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email ❌")
    }
  }

  // ---------------- UI ----------------
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          {!isForgotPassword ? (
            // ------------------ Login Form ------------------
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onLogin)}>
              <div className="flex flex-col items-center text-center pb-2">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                   Login with your email
                </p>
              </div>
              
              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
                <PasswordInput id="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Social Logins */}
              {/* <div className="grid grid-cols-3 gap-4"> */}
              {/* X */}
              {/* <Button variant="outline" type="button" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.693l-5.242-6.858-6.001 6.858H1.583l7.73-8.828L1.084 2.25h6.853l4.716 6.223 5.591-6.223z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with X</span>
                </Button> */}

              {/* Google */}
              <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>

              {/* GitHub */}
              {/* <Button variant="outline" type="button" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.55v-2.06c-3.2.7-3.88-1.54-3.88-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.21 1.78 1.21 1.04 1.77 2.72 1.26 3.38.96.11-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.52.11-3.16 0 0 .97-.31 3.18 1.18a11.03 11.03 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.64.23 2.86.11 3.16.75.81 1.2 1.85 1.2 3.11 0 4.44-2.69 5.41-5.25 5.69.41.36.78 1.1.78 2.23v3.3c0 .31.21.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with GitHub</span>
                </Button> */}
              {/* </div> */}

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/auth/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleForgotSubmit(onForgotPassword)}>
              <div className="grid gap-3">
                <Label htmlFor="resetEmail">Enter your email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="m@example.com"
                  {...registerForgot("email")}
                />
                {forgotErrors.email && <p className="text-red-500 text-sm">{forgotErrors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isForgotSubmitting}>
                {isForgotSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="text-sm underline-offset-2"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
