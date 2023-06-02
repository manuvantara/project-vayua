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

// import UserProfile from "@/components/UserProfile";

import { useForm } from "@mantine/form";
import { SearchDAOFormValues } from "@/types/forms";

import { SparklesIcon, Wand2Icon } from "lucide-react";

// <RenderUsingClientOnly />
import ClientOnly from "@/components/ClientOnly";

import { ETH_ADDRESS_REGEX } from "@/utils/regexes";

import React, { useState } from "react";
import { useAccount, useContractEvent, usePublicClient } from "wagmi";

import { ProfileView, UserStarringExtensionView } from "@/components/VRC1";

import { UserProfile, parseUserStarringExtension } from "@/utils/VRC1";

import {
  generateAvatarUrl,
  mockupAvatarUrl,
  parseProfile,
  mockupProfile,
  VRC1_CONTRACT_ADDRESS,
  VRC1_CONTRACT_ABI,
} from "@/utils/VRC1";
import Web3Button from "@/components/Web3Button";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    // name: "Illia Malovanyi",
    // bio: "Designer from San Francisco.",
    // avatar:
    //   "https://pbs.twimg.com/profile_images/1562381737677783042/Qk1v_yLB_400x400.jpg",
    // location: "San Francisco, USA",
    // website: "https://twitter.com/pantemon",
    extension: {
      standard: "VRC1",
      target: "User",
      version: "1.0.0",
      organisations: [],
    },
  });

  const publicClient = usePublicClient();

  // TODO: refactor to async useEffect
  const account = useAccount({
    async onConnect({ address }) {
      if (address) {
        const profileData = await publicClient.readContract({
          address: VRC1_CONTRACT_ADDRESS,
          abi: VRC1_CONTRACT_ABI,
          functionName: "profiles",
          args: [address],
        });

        const profile = parseProfile(profileData);
        // const profile = { name: "Illia Malovanyi" };
        // const profile = {
        //   name: "Illia Malovanyi",
        //   bio: "Designer from San Francisco.",
        //   website: "https://pantemon.sh",
        //   location: "Kyiv, Ukraine"
        // };
        // const profile = {
        //   name: "Illia Malovanyi",
        //   bio: "Designer from San Francisco",
        // };
        // console.log("userProfile=", profile);

        const extensionData = await publicClient.readContract({
          address: VRC1_CONTRACT_ADDRESS,
          abi: VRC1_CONTRACT_ABI,
          functionName: "profileExtensions",
          args: [address],
        });

        const extenstion = parseUserStarringExtension(extensionData);
        console.log("extension(UserStarringExtension)=", extenstion);

        setUserProfile({
          ...profile,
          extension: extenstion,
        });
      }
    },
  });

  useContractEvent({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    eventName: "ProfileExtensionChanged",
    listener: (logs) => {
      if (account.address) {
        const userLogs = logs.filter(
          (log) => log.args.profileOwner === account.address
        );
        const latestLog = userLogs[userLogs.length - 1];

        if (latestLog.args.extension) {
          const latestExtension = parseUserStarringExtension(
            latestLog.args.extension
          );

          setUserProfile({
            ...userProfile,
            extension: latestExtension,
          });
        }
      }

      console.log("UserProfileExtensionChanged=", logs);
    },
  });

  /// TODO: remove if 'watch' works
  useContractEvent({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    eventName: "ProfileChanged",
    listener: (logs) => {
      const organisationLogs = logs.filter(
        (log) => log.args.profileOwner === account.address
      );
      const latestLog = organisationLogs[organisationLogs.length - 1];

      if (latestLog.args.profile) {
        const latestProfile = parseProfile([
          latestLog.args.profile.name,
          latestLog.args.profile.bio,
          latestLog.args.profile.avatar,
          latestLog.args.profile.location,
          latestLog.args.profile.website,
        ]);

        setUserProfile({ ...userProfile, ...latestProfile });
      }

      console.log("UserProfileChanged=", logs);
    },
  });

  const form = useForm<SearchDAOFormValues>({
    validateInputOnChange: true,
    initialValues: {
      address: "",
    },
    validate: {
      address: (value) =>
        !ETH_ADDRESS_REGEX.test(value)
          ? value.length === 0
            ? null
            : "Please enter a valid Ethereum address"
          : null,
    },
  });

  return (
    <main className="flex flex-col gap-8 w-fit m-auto mb-12">
      <div className="flex flex-col lg:text-left text-center">
        <h1 className="mt-12 pb-1 tracking-tight text-center font-extrabold leading-none text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-black/70 to-black text-center">
          Welcome to Vayua
        </h1>
        <p className="text-center text-muted-foreground text-xl md:text-2xl font-semibold leading-none tracking-tight">
          Be open to new experiences.
        </p>
      </div>
      <Card className="w-full flex flex-col justify-between">
        <CardFooter className="flex flex-col md:flex-row gap-4 justify-between">
          <Input
            name="address"
            type="text"
            autoComplete="url"
            className="bg-white p-4 h-10"
            placeholder="Search DAO by address"
            {...form.getInputProps("address")}
          />
          {form.errors.address && (
            <p className="text-sm mt-1 text-destructive">
              {form.errors.address}
            </p>
          )}
          <Button
            className="w-full md:w-auto"
            asChild
            aria-disabled={!form.isValid()}
          >
            <Link href={`/organisations/${form.values.address}`}>Search</Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="grid grid-cols-1 md:grid-rows-2 md:grid-flow-col gap-4">
        {/* <ProfileCard> */}
        {account.address && (
          <Card className="row-span-2 w-full min-w-xs md:max-w-sm">
            <CardHeader>
              <ClientOnly>
                <div className="flex flex-col items-center">
                    <ProfileView
                      accountAddress={account.address}
                      profile={userProfile}
                    />
                </div>
              </ClientOnly>
            </CardHeader>
            <CardFooter>
              <Web3Button className="w-full text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-white">
                <Link href="/settings">Settings</Link>
              </Web3Button>
            </CardFooter>
          </Card>
        )}
        {/* </ProfileCard> */}

        {/* WizardCard */}
        <Card className="h-fit flex flex-col justify-between w-full md:max-w-sm">
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
            <Web3Button className="w-full" asChild>
              <Link href="/wizard">Create a new DAO</Link>
            </Web3Button>
          </CardFooter>
        </Card>
        {/* </WizardCard> */}

        {/* <UserStarringExtensionViewCard> */}
        <Card className="h-full flex-col justify-between w-full min-w-xs md:max-w-sm">
          <CardHeader className="rounded-t-lg h-full">
            <SparklesIcon size={32} />
            <CardTitle className="text-xl md:text-2xl">
              User Starring Extension
            </CardTitle>
            <CardDescription>
              A tool that enables users to bookmark or highlight organizations
              they want to remember.
            </CardDescription>
            {userProfile.extension.organisations.length > 0 && (
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
