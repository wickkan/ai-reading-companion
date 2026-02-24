import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { PASSAGE_TITLE } from "@/lib/passage";

interface HeaderProps {
  showProgress?: boolean;
}

export function Header({ showProgress = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm"
          >
            {APP_NAME}
          </Link>

          {showProgress && (
            <span className="text-xs text-gray-400">{PASSAGE_TITLE}</span>
          )}
        </div>
      </div>
    </header>
  );
}
