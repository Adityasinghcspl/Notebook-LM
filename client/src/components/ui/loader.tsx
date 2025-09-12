import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: number;
  className?: string;
}

export function Loader({ size = 32, className }: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center h-screen", className)}>
     <Loader2
        className="animate-spin text-muted-foreground"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
