import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Profile from "@/components/Profile";
import { matches, useForm } from "@mantine/form";
import { SearchDAOFormValues } from "@/types/forms";
import { Fingerprint, Wand2 } from "lucide-react";
import { useAccount } from "wagmi";

export default function Home() {
  const form = useForm<SearchDAOFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      address: "",
    },
    validate: {
      address: matches(
        /^(0x){1}[0-9a-fA-F]{40}$/,
        "Please enter a valid Ethereum address"
      ),
    },
  });

  const { address } = useAccount(); 
  return (
    <main className="flex flex-col gap-5">
      <div>
        <div className="flex flex-col lg:text-left text-center">
          <h1 className="mt-12 tracking-tight text-center md:text-left font-extrabold text-5xl lg:text-6xl leading-tight xl:leading-snug bg-clip-text text-transparent bg-gradient-to-b from-black/60 to-black">
            Welcome to Vayua
          </h1>
          <p className="pt-1 text-muted-foreground xl:leading-snug md:text-left">
            Be open to new experiences
          </p>
        </div>
        <div className="mt-5 flex md:flex-row md:justify-between gap-5 md:items-stretch flex-col items-center">
          <Card className="md:w-1/2 flex flex-col justify-between">
            <CardHeader className="rounded-t-lg h-full">
              <Wand2 className="w-8 h-8 mr-2 mt-2 mb-2" />
              <CardTitle className="text-xl md:text-2xl">
                Vayua Wizard
              </CardTitle>
              <CardDescription className="text-base">
                Vayua Wizard is a powerful tool that allows you to effortlessly
                set up a new Decentralized Autonomous Organization (DAO) in just
                a few minutes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-none bg-white p-5 pt-3">
              <Button asChild>
                <Link href="/wizard">Deploy DAO</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="md:w-1/2 w-full flex flex-col justify-between">
            <CardHeader className="rounded-t-lg h-full">
              <Fingerprint className="w-8 h-8 mr-2 mt-2 mb-2" />
              <CardTitle className="text-xl md:text-2xl">
                Vayua Identity
              </CardTitle>
              <CardDescription className="text-base">
                Take control of your online persona by editing your profile,
                adding new information, profile picture and expressing your
                individuality through your personal details.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-none bg-white p-5 pt-3">
              <Button variant="outline" asChild>
                <Link href="/settings">Edit my profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div>
        <Card className="w-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Search DAO</CardTitle>
          </CardHeader>
          <CardFooter className="flex md:flex-row gap-5 justify-between flex-col">
            <Input
              id="address"
              name="address"
              type="text"
              autoComplete="url"
              className="bg-white"
              placeholder="Search DAO by address"
              {...form.getInputProps("address")}
            />
            {form.errors.address && (
              <p className="text-sm mt-1 text-destructive">
                {form.errors.address}
              </p>
            )}
            <Button
              className="md:w-auto w-full"
              asChild
              aria-disabled={!form.isValid()}
            >
              <Link href={`/organisations/${form.values.address}`}>Search</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="flex lg:flex-row flex-col justify-between w-full gap-5">
      <Profile address={address}/>
        <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
          <div className="text-xl font-semibold px-5 pt-5 pb-3">Saved DAOs</div>
          <div className="px-5 pt-3 pb-5 font-light">
            Create a new DAO or add existing one.
          </div>
        </div>
      </div>
    </main>
  );
}
