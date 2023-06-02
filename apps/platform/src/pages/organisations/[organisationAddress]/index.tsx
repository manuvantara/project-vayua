import type { GetServerSideProps } from "next";
import Proposals from "@/components/Proposals";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { createPublicClient, http } from "viem";
import { thetaTestnet } from "@/utils/chains/theta-chains";
import React, { useState } from "react";
import {
  type OrganisationProfile,
  parseProfile,
  parseUserStarringExtension,
  UserStarringExtension,
  VRC1_CONTRACT_ABI,
  VRC1_CONTRACT_ADDRESS,
} from "@/utils/VRC1";
import { ProfileView } from "@/components/VRC1";
import { Card, CardFooter, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Settings, Star, StarOff } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import DelegateModal from "@/components/DelegateModal";
import {
  useAccount,
  useContractEvent,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import Web3Button from "@/components/Web3Button";

export default function OrganisationPage({
  organisationAddress,
  parsedOrganisationProfile,
}: {
  organisationAddress: `0x${string}`;
  parsedOrganisationProfile: OrganisationProfile;
}) {
  const publicClient = usePublicClient();
  const [organisationProfile, setOrganisationProfile] =
    useState<OrganisationProfile>(parsedOrganisationProfile);

  const [userProfileExtension, setUserProfileExtension] =
    useState<UserStarringExtension>({
      standard: "VRC1",
      target: "User",
      version: "1.0.0",
      organisations: [],
    });

  const account = useAccount({
    async onConnect({ address }) {
      if (address) {
        const data = await publicClient.readContract({
          address: VRC1_CONTRACT_ADDRESS,
          abi: VRC1_CONTRACT_ABI,
          functionName: "profileExtensions",
          args: [address],
        });

        const userProfileExtension = parseUserStarringExtension(data);
        console.log("userProfileExtension=", userProfileExtension);

        setUserProfileExtension(userProfileExtension);
      }
    },
  });

  const setProfileExtensionWrite = useContractWrite({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    functionName: "setProfileExtension",
  });

  const waitForSetUserProfileExtensionTransaction = useWaitForTransaction({
    hash: setProfileExtensionWrite.data?.hash,
    onSettled(data, error) {
      console.log(`Transaction ${data?.transactionHash} settled`, {
        data,
        error,
      });
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
          setUserProfileExtension(latestExtension);
        }
      }

      console.log("UserProfileExtensionChanged=", logs);
    },
  });

  const toggleStarOrganisation = () => {
    const extension = userProfileExtension;

    let temp: UserStarringExtension;

    if (!extension.organisations.includes(organisationAddress)) {
      temp = {
        ...extension,
        organisations: [...extension.organisations, organisationAddress],
      };
    } else {
      temp = {
        ...extension,
        organisations: extension.organisations.filter(
          (element) => element !== organisationAddress
        ),
      };
    }

    console.log("temp=", temp);

    setProfileExtensionWrite.write({
      args: [JSON.stringify(temp)],
    });
  };

  return (
    <div className="lg:grid lg:grid-cols-3 gap-5 pt-8">
      <Card className="grid">
        <CardHeader>
          <div className="flex flex-col items-center">
            <ProfileView
              accountAddress={organisationAddress}
              profile={organisationProfile}
            />
          </div>
        </CardHeader>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button asChild className="w-full text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-white">
            <Link href={`${organisationAddress}/settings`}>
              <Settings size={20} />
              <span className="ml-2">Settings</span>
            </Link>
          </Button>

          {/* ClientOnly => RenderUsingClientOnly */}
          <ClientOnly>
            <Button
                className="w-full text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-white"
              onClick={toggleStarOrganisation}
              disabled={!account.isConnected}
              loading={
                setProfileExtensionWrite.isLoading ||
                waitForSetUserProfileExtensionTransaction.isLoading
              }
              prefix={
                userProfileExtension.organisations.includes(
                  organisationAddress
                ) ? (
                  <StarOff size={20} />
                ) : (
                  <Star size={20} />
                )
              }
            >
              {userProfileExtension.organisations.includes(
                organisationAddress
              ) ? (
                <span>Unstar</span>
              ) : (
                <span>Star</span>
              )}
            </Button>
          </ClientOnly>

          <Button className="w-full text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-white" asChild>
            <Link href={`${organisationAddress}/proposals/new`}>
              <Plus size={20} />
              <span className="ml-2">Propose</span>
            </Link>
          </Button>
          <DelegateModal />
        </CardFooter>
      </Card>
      {/* </OrganisationCard> */}
      <Proposals organisationAddress={organisationAddress} />
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  const publicClient = createPublicClient({
    chain: thetaTestnet,
    transport: http(),
  });

  try {
    // If there is no token, the contract will throw an error, and we will redirect to the 404 page
    await publicClient.readContract({
      address: organisationAddress,
      abi: GOVERNOR_ABI,
      functionName: "token",
    });
  } catch {
    const query = new URLSearchParams({
      message: "Organisation not found",
      description:
        "It looks like the address you entered is not a valid organisation address.",
    });

    return {
      redirect: {
        destination: `/invalid-organisation?${query}`,
        permanent: false,
      },
    };
  }

  const organisationProfile = await publicClient.readContract({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    functionName: "profiles",
    args: [organisationAddress],
  });

  return {
    props: {
      organisationAddress,
      parsedOrganisationProfile: parseProfile(organisationProfile),
    },
  };
};
