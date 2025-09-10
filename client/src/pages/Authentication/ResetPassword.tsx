import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

export function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <form className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter your new password
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput id="new-password" required />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Re-enter Password</Label>
                  <PasswordInput id="confirm-password" required />
                </div>

                <Button type="submit" className="w-full mt-2">
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
