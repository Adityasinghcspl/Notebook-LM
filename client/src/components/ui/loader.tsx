import { Loader2 } from "lucide-react";

export function Loader({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2
        className="animate-spin text-muted-foreground"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
