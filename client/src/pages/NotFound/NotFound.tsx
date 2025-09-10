import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          {/* Disconnected SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17.25L4.5 12m0 0l5.25-5.25M4.5 12h15"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
          </svg>

          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The page you are looking for doesn’t exist or has been moved.
          </p>

          <Button asChild className="mt-4">
            <a href="/">Go Back Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
