import ClientOnly from "@/components/ClientOnly";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";
import useScroll from "@/utils/hooks/use-scroll";
import { cn } from "@/utils/class-merge";

export default function Header() {
  const scrolled = useScroll(0);

  return (
    <footer className="mt-5 flex lg:flex-row flex-col-reverse items-center justify-between container w-full py-4 min-h-16">
      <div className="flex items-center h-full justify-between lg:mt-0 mt-2 lg:text-left text-center">
        Made with ♡ by Manuvantara Devepopment
      </div>
      <div className="flex flex-row lg:gap-8 gap-4 font-light">
        <Link href="">Docs</Link>
        <Link href="">GitHub</Link>
        <Link href="">Devpost</Link>
        <Link href="">Twitter</Link>
      </div>
    </footer>
  );
}
