import Image from "next/image";

export default function Header() {
    // const

  return (
    <div>
      <header className="container h-16">
        <div className="flex items-center justify-between">
          <Image
            src="/logotype.jpg"
            alt="Vayua Logo"
            width={64}
            height={64}
          />
          <div>Menu</div>
        </div>
      </header>
    </div>
  );
}
