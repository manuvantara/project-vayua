import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={` ${inter.className}`}>
      Home page
      <Link href={{ pathname: `/settings` }}>
        <Button variant="outline">User settings</Button>
      </Link>
      <Link href={{ pathname: `/wizard` }}>
        <Button variant="outline">Wizard</Button>
      </Link>
      <Link href={{ pathname: "#" }}>
        <Button variant="outline">Landing</Button>
      </Link>
    </main>
  );
}
