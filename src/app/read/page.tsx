import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PassageReader } from "@/components/passage/PassageReader";
import { SessionProvider } from "@/context/SessionContext";
import type { ReadingSession } from "@/lib/types";

// Next.js passes searchParams as a plain object in App Router page components
interface ReadPageProps {
  searchParams: Promise<{ difficulty?: string }>;
}

async function ReadPageContent({ searchParams }: ReadPageProps) {
  const params = await searchParams;
  const difficulty = (params.difficulty ?? "intermediate") as ReadingSession["difficulty"];

  return (
    <SessionProvider difficulty={difficulty}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header showProgress />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
          <PassageReader />
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}

export default function ReadPage(props: ReadPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
          Loading…
        </div>
      }
    >
      <ReadPageContent {...props} />
    </Suspense>
  );
}
