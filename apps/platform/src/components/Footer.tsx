import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function Header() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-muted-foreground bg-gradient-to-b from-[#f7f7f7] to-white">
      <div className="py-12 mt-12 sm:mt-16 overflow-hidden container sm:py-16 min-h-16">
        <nav className="w-full" aria-label="Footer">
          <ul className="sm:space-x-12 columns-2 -mb-6 sm:flex sm:justify-center">
            <li className="pb-6">
              <Link className="hover:text-foreground" href="/devpost">
                DevPost
              </Link>
            </li>
            <li className="pb-6">
              <Link className="hover:text-foreground" href="/docs">
                Docs
              </Link>
            </li>
            <li className="pb-6">
              <Link
                className="hover:text-foreground"
                href="mailto:denys.kravchuk@manuvantara.com"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-10 w-full space-x-10 flex justify-center">
          <Link href="/twitter">
            <Twitter className="w-6 h-6 hover:text-foreground" />
          </Link>
          <Link href="/github">
            <Github className="w-6 h-6 hover:text-foreground" />
          </Link>
        </div>
        <p className="text-xs text-center mt-10 leading-5">
          © {currentYear} Manuvantara Development, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
