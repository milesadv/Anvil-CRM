import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-muted/60", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.03) 40%, hsl(0 0% 100% / 0.06) 50%, hsl(0 0% 100% / 0.03) 60%, transparent 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 2s ease-in-out infinite",
      }}
      {...props}
    />
  );
}

export { Skeleton };
