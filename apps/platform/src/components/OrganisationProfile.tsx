// TODO: implement toast notifications

import { shortenAddress } from "@/utils/shorten-address";
import Link from "next/link";
import { Button } from "./ui/Button";
import {
  LinkIcon,
  MapPin,
  Plus,
  ScrollText,
  Settings,
  Star,
  StarOff,
} from "lucide-react";
import DelegateModal from "./DelegateModal";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";

import {
  VRC1_CONTRACT_ADDRESS,
  VRC1_CONTRACT_ABI,
} from "@/utils/abi/VRC1-contract"; // TODO: change path to @/utils/VRC1 or @/utils/VRC1-contract or @/utils/contracts/VRC1

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import Image from "next/image";
import { getInitials } from "@/utils/shorten-name";

// TODO: rename to <RenderUsingClientOnly>{children}</RenderUsingClientOnly>
import ClientOnly from "./ClientOnly";

/// Utils section starts here

type Profile = {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
};

type ProfileExtension = {
  standard: "VRC1";
};

type UserProfileExtension = ProfileExtension & {
  target: "User";
  version: "1.0.0";
  organisations: `0x${string}`[];
};

// type UserProfile = Profile & { extension: UserProfileExtension };
type OrganisationProfile = Profile;

function parseOrganisationProfile(
  data: readonly [string, string, string, string, string]
): Profile {
  // if (!isProfilish(data)) {
  //   throw new Error("Data is not profilish");
  // }

  const profile: Profile = {};

  if (data[0].length > 0) {
    profile.name = data[0];
  }

  if (data[1].length > 0) {
    profile.bio = data[0];
  }

  if (data[2].length > 0) {
    profile.avatar = data[0];
  }

  if (data[3].length > 0) {
    profile.location = data[0];
  }

  if (data[4].length > 0) {
    profile.website = data[0];
  }

  return profile;
}

function parseUserProfileExtension(data: string) {
  // if (!isExtentionish(data)) {
  //   throw new Error("Data is not extentionish");
  // }

  let userProfileExtension: UserProfileExtension;

  if (data.length === 0) {
    userProfileExtension = {
      standard: "VRC1",
      target: "User",
      version: "1.0.0",
      organisations: [],
    };
  } else {
    try {
      userProfileExtension = JSON.parse(data);
    } catch (error) {
      throw new Error("Unknown profile extension");
    }
  }

  return userProfileExtension;
}

/// Utils section ends here

export default function ({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const [organisationProfile, setOrganisationProfile] =
    useState<OrganisationProfile>({});

  const [userProfileExtension, setUserProfileExtension] =
    useState<UserProfileExtension>({
      standard: "VRC1",
      target: "User",
      version: "1.0.0",
      organisations: [],
    });

  const publicClient = usePublicClient();

  // TODO: refactor to async useEffect
  const account = useAccount({
    async onConnect({ address }) {
      if (address) {
        const data = await publicClient.readContract({
          address: VRC1_CONTRACT_ADDRESS,
          abi: VRC1_CONTRACT_ABI,
          functionName: "profileExtensions",
          args: [address],
        });

        const userProfileExtension = parseUserProfileExtension(data);
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
          const latestExtension = parseUserProfileExtension(
            latestLog.args.extension
          );
          setUserProfileExtension(latestExtension);
        }
      }

      console.log("UserProfileExtensionChanged=", logs);
    },
  });

  /// TODO: Check whether watch will update the organisation profile automatically and useContractEvent can be omitted
  const organisationProfileRead = useContractRead({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    functionName: "profiles",
    args: [organisationAddress],
    // watch: true,
  });

  useEffect(() => {
    if (organisationProfileRead.data) {
      const organisationProfile = parseOrganisationProfile(
        organisationProfileRead.data
      );
      console.log("organisationProfile=", organisationProfile);

      setOrganisationProfile(organisationProfile);
    }
  }, [organisationProfileRead.isSuccess]);

  /// TODO: remove if 'watch' works
  useContractEvent({
    address: VRC1_CONTRACT_ADDRESS,
    abi: VRC1_CONTRACT_ABI,
    eventName: "ProfileChanged",
    listener: (logs) => {
      const organisationLogs = logs.filter(
        (log) => log.args.profileOwner === organisationAddress
      );
      const latestLog = organisationLogs[organisationLogs.length - 1];

      if (latestLog.args.profile) {
        const latestProfile = parseOrganisationProfile([
          latestLog.args.profile.name,
          latestLog.args.profile.bio,
          latestLog.args.profile.avatar,
          latestLog.args.profile.location,
          latestLog.args.profile.website,
        ]);

        setOrganisationProfile(latestProfile);
      }

      console.log("OrganisationProfileChanged=", logs);
    },
  });

  const toggleStarOrganisation = () => {
    const extension = userProfileExtension;

    let temp: UserProfileExtension;

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

  const avatarFallbackUrl = (
    organisationName: string | undefined,
    organisationAddress: `0x${string}`
  ) => {
    // https://avatar.vercel.sh/${organisationAddress
    // }.svg?text=${encodeURIComponent(
    //   getInitials(organisationProfile.name as string)
    // )}`

    let url = `https://avatar.vercel.sh/${organisationAddress}.svg`;

    if (organisationName) {
      url += `?text=` + encodeURIComponent(getInitials(organisationName));
    }

    return url;
  };

  return (
    <div className="col-span-1 bg-white border border-black-500 rounded-lg p-5 mt-5">
      <div className="flex flex-row items-center gap-5 mb-5">
        <Avatar className="h-16 w-16">
          <AvatarImage
            className="object-top"
            decoding="async"
            loading="lazy"
            title={`Avatar for ${organisationProfile.name}`}
            src={organisationProfile.avatar}
          />
          <AvatarFallback delayMs={300}>
            <Image
              src={avatarFallbackUrl(
                organisationProfile.name,
                organisationAddress
              )}
              width="80"
              height="80"
              alt={`Avatar for ${
                organisationProfile.name || organisationAddress
              }`}
              className="select-none pointer-events-none rounded-full"
            />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">
          {organisationProfile.name ? "..." : organisationProfile.name}
        </h1>
      </div>
      <div className="gap-2 grid grid-cols-2">
        <Button variant="outline" asChild>
          <Link href={`${organisationAddress}/settings`}>
            <Settings size={20} />
            <span className="ml-2">Settings</span>
          </Link>
        </Button>

        {/* ClientOnly => RenderUsingClientOnly */}
        <ClientOnly>
          <Button
            variant="outline"
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

        <Button variant="outline" asChild>
          <Link href={`${organisationAddress}/proposals/new`}>
            <Plus size={20} />
            <span className="ml-2">Propose</span>
          </Link>
        </Button>
        <DelegateModal />
      </div>
      {organisationProfile.bio && (
        <div className="mt-5 max-w-3xl">{organisationProfile.bio}</div>
      )}
      <div className="mt-5 flex flex-col mt-3 gap-1">
        {organisationProfile.location && (
          <div className="flex flex-row items-center gap-2">
            <MapPin size={20} />
            <div>{organisationProfile.location}</div>
          </div>
        )}
        {organisationProfile.website && (
          <div className="flex flex-row items-center gap-2">
            <LinkIcon size={20} />
            <div>
              <Link href={organisationProfile.website as string}>
                {organisationProfile.website}
              </Link>
            </div>
          </div>
        )}
        <div className="flex flex-row items-center gap-2">
          <ScrollText size={20} />
          <div>
            <Link
              target="_blank"
              href={`https://testnet-explorer.thetatoken.org/account/${organisationAddress}`}
              className="border-b border-[#999] border-dashed"
            >
              {organisationAddress ? shortenAddress(organisationAddress) : null}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
