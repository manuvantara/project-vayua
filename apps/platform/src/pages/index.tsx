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


export default function Home() {

  const form = useForm<SearchDAOFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      address: "",
    },
    validate: {
      address: matches(
        /^(0x){1}[0-9a-fA-F]{40}$/,
        "Please enter a valid address"
      ),
    }
  });

  
  return (
    <main className="flex flex-col gap-8">
      <div className="p-6 border rounded-lg text-card-foreground">
        <div className="lg:text-left text-center">
          <h1 className="text-4xl font-bold">Welcome to Vayua</h1>
          <p className="pt-1">Be open to new experiences</p>
        </div>
        <div className="mt-7 flex md:flex-row md:justify-between gap-6 md:items-stretch flex-col items-center">
          <Card className="md:w-1/2 flex flex-col justify-between">
            <CardHeader className="rounded-t-lg h-full">
              <CardTitle className="text-lg md:text-xl">Vayua Wizard</CardTitle>
              <CardDescription className="font-light">
                Vayua Wizard is a powerful tool that allows you to effortlessly
                set up a new Decentralized Autonomous Organization (DAO) in just
                a few minutes.
              </CardDescription>
            </CardHeader>
            <CardFooter className="rounded-b-lg">
              <Link href={{ pathname: `/wizard` }}>
                <Button>Deploy a DAO</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="md:w-1/2 w-full flex flex-col justify-between">
            <CardHeader className="rounded-t-lg h-full">
              <CardTitle className="text-lg md:text-xl">
                Vayua Identity
              </CardTitle>
              <CardDescription className="font-light">
                Take control of your online persona by editing your profile,
                adding new information, profile picture and expressing your
                individuality through your personal details.
              </CardDescription>
            </CardHeader>
            <CardFooter className="rounded-b-lg">
              <Link href={{ pathname: `/settings` }}>
                <Button variant="outline">Edit my profile</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div>
        <Card className="w-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Search DAO</CardTitle>
          </CardHeader>
          <CardFooter className="flex md:flex-row gap-4 justify-between flex-col">
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
            <Link href={{ pathname: `/organisations/${form.getInputProps("address").value}` }}>
              <Button className="md:w-auto w-full">Search</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="flex lg:flex-row flex-col justify-between w-full gap-6">
        <Profile />
        <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
          <div className="text-xl font-semibold px-6 pt-6 pb-3">Saved DAOs</div>
          <div className="px-6 pt-3 pb-6 font-light">
            Create a new DAO or add existing one
          </div>
        </div>
      </div>
    </main>
  );
}
