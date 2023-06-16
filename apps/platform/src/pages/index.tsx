import type { SearchDAOFormValues } from '@/types/forms';

import { ProfileView, UserStarringExtensionView } from '@/components/VRC1';
import Web3Button from '@/components/Web3Button';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import useUserProfile from '@/hooks/use-user-profile';
import { ETH_ADDRESS_REGEX } from '@/utils/regexes';
import { useForm } from '@mantine/form';
import { SparklesIcon, Wand2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();
  const userProfile = useUserProfile();

  const form = useForm<SearchDAOFormValues>({
    initialValues: {
      address: '',
    },
    validate: {
      address: (value) =>
        !ETH_ADDRESS_REGEX.test(value)
          ? value.length === 0
            ? null
            : 'Please enter a valid Ethereum address'
          : null,
    },
    validateInputOnChange: true,
  });

  return (
    <main className="m-auto mb-12 flex w-fit flex-col gap-8">
      <div className="flex flex-col text-center lg:text-left">
        <h1 className="mt-12 bg-gradient-to-b from-black/70 to-black bg-clip-text pb-1 text-center text-5xl font-extrabold leading-none tracking-tight text-transparent lg:text-6xl">
          Welcome to Vayua
        </h1>
        <p className="text-center text-xl font-semibold leading-none tracking-tight text-muted-foreground md:text-2xl">
          Be open to new experiences.
        </p>
      </div>

      <Card className="flex w-full flex-col justify-between">
        <CardFooter className="flex flex-col justify-between gap-4 md:flex-row">
          <Input
            autoComplete="url"
            className="h-10 bg-white p-4"
            name="address"
            placeholder="Search DAO by address"
            type="text"
            {...form.getInputProps('address')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (!form.errors.address) {
                  router.push(`/organisations/${form.values.address}`);
                }
              }
            }}
          />
          {form.errors.address && (
            <p className="mt-1 text-sm text-destructive">
              {form.errors.address}
            </p>
          )}
          <Button
            aria-disabled={!form.isValid()}
            asChild
            className="w-full md:w-auto"
          >
            <Link href={`/organisations/${form.values.address}`}>Search</Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-flow-col md:grid-rows-2">
        {/* <ProfileCard> */}

        <Card className="row-span-2 w-full md:max-w-sm">
          <CardHeader>
            <ProfileView accountAddress={address} profile={userProfile} />
          </CardHeader>
          <CardFooter>
            <Web3Button
              asChild
              className="w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900"
            >
              <Link href="/settings">Settings</Link>
            </Web3Button>
          </CardFooter>
        </Card>

        {/* </ProfileCard> */}

        {/* WizardCard */}
        <Card className="flex h-fit w-full flex-col justify-between md:max-w-sm">
          <CardHeader className="rounded-t-lg">
            <Wand2Icon size={32} />
            <CardTitle>Vayua Wizard</CardTitle>
            <CardDescription>
              Vayua Wizard is a powerful tool that allows you to effortlessly
              set up a new Decentralized Autonomous Organization (DAO) in just a
              few minutes.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Web3Button asChild className="w-full">
              <Link href="/wizard">Create a new DAO</Link>
            </Web3Button>
          </CardFooter>
        </Card>
        {/* </WizardCard> */}

        {/* <UserStarringExtensionViewCard> */}
        <Card className="min-w-xs h-full w-full flex-col justify-between md:max-w-sm">
          <CardHeader className="h-full rounded-t-lg">
            <SparklesIcon size={32} />
            <CardTitle className="text-xl md:text-2xl">
              User Starring Extension
            </CardTitle>
            <CardDescription>
              A tool that enables users to bookmark or highlight organizations
              they want to remember.
            </CardDescription>
            {userProfile && userProfile.extension.organisations.length > 0 && (
              <UserStarringExtensionView extension={userProfile.extension} />
            )}
          </CardHeader>
        </Card>
        {/* </UserStarringExtensionViewCard> */}
      </div>
    </main>
  );
}

// const ProfileCard = () => (
//   <Card className="flex flex-col justify-between w-full">
//     <UserProfile />
//   </Card>
// );

// const WizardCard = () => (
//   <Card className="flex flex-col justify-between w-full">
//     <CardHeader className="rounded-t-lg h-full">
//       <Wand2 className="w-8 h-8 mr-2 mt-2 mb-2" />
//       <CardTitle className="text-xl md:text-2xl">Vayua Wizard</CardTitle>
//       <CardDescription className="text-base">
//         Vayua Wizard is a powerful tool that allows you to effortlessly set up a
//         new Decentralized Autonomous Organization (DAO) in just a few minutes.
//       </CardDescription>
//     </CardHeader>
//     <CardFooter className="border-none bg-white p-5 pt-3">
//       <Button asChild>
//         <Link href="/wizard">Deploy DAO</Link>
//       </Button>
//     </CardFooter>
//   </Card>
// );

// const IdentityCard = () => (
//   <Card className="flex flex-col justify-between w-full">
//     <CardHeader className="rounded-t-lg h-full">
//       <Fingerprint className="w-8 h-8 mr-2 mt-2 mb-2" />
//       <CardTitle className="text-xl md:text-2xl">Vayua Identity</CardTitle>
//       <CardDescription className="text-base">
//         Take control of your online persona by editing your profile, adding new
//         information, profile picture and expressing your individuality through
//         your personal details.
//       </CardDescription>
//     </CardHeader>
//     <CardFooter className="border-none bg-white p-5 pt-3">
//       <Button variant="outline" asChild>
//         <Link href="/settings">Edit my profile</Link>
//       </Button>
//     </CardFooter>
//   </Card>
// );
