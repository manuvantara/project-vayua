import { Button, Header } from "ui";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Header text="Web" />
      <Button />
      <Link href='/docs'>
        Go to docs
      </Link>
    </>
  );
}
