import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4 max-w-3xl">
        <p className="text-center text-xs text-gray-400">
          {APP_NAME} · Built for EdAccelerator
        </p>
      </div>
    </footer>
  );
}
