import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-success-dark">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          {router.query?.message || "Page not found"}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          {router.query?.description || "Sorry, we couldn’t find the page you’re looking for."}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            asChild
            variant="secondary"
            className="bg-success hover:bg-success-light text-white rounded-md"
          >
            <Link href="/">Go back home</Link>
          </Button>
          <Link
            href="/docs"
            className="text-sm flex items-center font-semibold"
          >
            Documentation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </main>
  );
}
