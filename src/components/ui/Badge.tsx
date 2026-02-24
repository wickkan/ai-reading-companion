interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
