// TODO: implement toast notifications

import {
  VRC1_CONTRACT_ABI,
  VRC1_CONTRACT_ADDRESS,
} from '@/utils/abi/VRC1-contract';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
import {
  LinkIcon,
  MapPin,
  Plus,
  ScrollText,
  Settings,
  Star,
  StarOff,
} from 'lucide-react';
import Link from 'next/link';
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';

import DelegateModal from './DelegateModal';
import { Button } from './ui/Button'; // TODO: change path to @/utils/VRC1 or @/utils/VRC1-contract or @/utils/contracts/VRC1
import { getInitials } from '@/utils/helpers/common.helper';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// TODO: rename to <RenderUsingClientOnly>{children}</RenderUsingClientOnly>
import ClientOnly from './ClientOnly';
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar';

/// Utils section starts here

type Profile = {
  avatar?: string;
  bio?: string;
  location?: string;
  name?: string;
  website?: string;
};

type ProfileExtension = {
  standard: 'VRC1';
};

type UserProfileExtension = ProfileExtension & {
  organisations: `0x${string}`[];
  target: 'User';
  version: '1.0.0';
};

// type UserProfile = Profile & { extension: UserProfileExtension };
type OrganisationProfile = Profile;

function parseOrganisationProfile(
  data: readonly [string, string, string, string, string],
): Profile {
  // if (!isProfilish(data)) {
  //   throw new Error("Data is not profilish");
  // }

  const profile: Profile = {};

  if (data[0].length > 0) {
    profile.name = data[0];
  }

  if (data[1].length > 0) {
    profile.bio = data[1];
  }

  if (data[2].length > 0) {
    profile.avatar = data[2];
  }

  if (data[3].length > 0) {
    profile.location = data[3];
  }

  if (data[4].length > 0) {
    profile.website = data[4];
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
      organisations: [],
      standard: 'VRC1',
      target: 'User',
      version: '1.0.0',
    };
  } else {
    try {
      userProfileExtension = JSON.parse(data);
    } catch (error) {
      throw new Error('Unknown profile extension');
    }
  }

  return userProfileExtension;
}

/// Utils section ends here

export default function OrganisationProfile({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const [organisationProfile, setOrganisationProfile] =
    useState<OrganisationProfile>({});

  const [userProfileExtension, setUserProfileExtension] =
    useState<UserProfileExtension>({
      organisations: [],
      standard: 'VRC1',
      target: 'User',
      version: '1.0.0',
    });

  const publicClient = usePublicClient();

  // TODO: refactor to async useEffect
  const account = useAccount({
    async onConnect({ address }) {
      if (address) {
        const data = await publicClient.readContract({
          abi: VRC1_CONTRACT_ABI,
          address: VRC1_CONTRACT_ADDRESS,
          args: [address],
          functionName: 'profileExtensions',
        });

        const userProfileExtension = parseUserProfileExtension(data);
        console.log('userProfileExtension=', userProfileExtension);

        setUserProfileExtension(userProfileExtension);
      }
    },
  });

  const setProfileExtensionWrite = useContractWrite({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    functionName: 'setProfileExtension',
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
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    eventName: 'ProfileExtensionChanged',
    listener: (logs) => {
      if (account.address) {
        const userLogs = logs.filter(
          (log) => log.args.profileOwner === account.address,
        );
        const latestLog = userLogs[userLogs.length - 1];

        if (latestLog.args.extension) {
          const latestExtension = parseUserProfileExtension(
            latestLog.args.extension,
          );
          setUserProfileExtension(latestExtension);
        }
      }

      console.log('UserProfileExtensionChanged=', logs);
    },
  });

  /// TODO: Check whether watch will update the organisation profile automatically and useContractEvent can be omitted
  const organisationProfileRead = useContractRead({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    args: [organisationAddress],
    functionName: 'profiles',
    // watch: true,
  });

  useEffect(() => {
    if (organisationProfileRead.data) {
      const organisationProfile = parseOrganisationProfile(
        organisationProfileRead.data,
      );
      console.log('organisationProfile=', organisationProfile);

      setOrganisationProfile(organisationProfile);
    }
  }, [organisationProfileRead.isSuccess]);

  /// TODO: remove if 'watch' works
  useContractEvent({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    eventName: 'ProfileChanged',
    listener: (logs) => {
      const organisationLogs = logs.filter(
        (log) => log.args.profileOwner === organisationAddress,
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

      console.log('OrganisationProfileChanged=', logs);
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
          (element) => element !== organisationAddress,
        ),
      };
    }

    console.log('temp=', temp);

    setProfileExtensionWrite.write({
      args: [JSON.stringify(temp)],
    });
  };

  const avatarFallbackUrl = (
    organisationName: string | undefined,
    organisationAddress: `0x${string}`,
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
    <div className="border-black-500 col-span-1 mt-5 rounded-lg border bg-white p-5">
      <div className="mb-5 flex flex-row items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarImage
            className="object-top"
            decoding="async"
            loading="lazy"
            src={organisationProfile.avatar}
            title={`Avatar for ${organisationProfile.name}`}
          />
          <AvatarFallback delayMs={300}>
            <Image
              alt={`Avatar for ${
                organisationProfile.name || organisationAddress
              }`}
              src={avatarFallbackUrl(
                organisationProfile.name,
                organisationAddress,
              )}
              className="pointer-events-none select-none rounded-full"
              height="80"
              width="80"
            />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">
          {organisationProfile.name || '...'}
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link href={`${organisationAddress}/settings`}>
            <Settings size={20} />
            <span className="ml-2">Settings</span>
          </Link>
        </Button>

        {/* ClientOnly => RenderUsingClientOnly */}
        <ClientOnly>
          <Button
            loading={
              setProfileExtensionWrite.isLoading ||
              waitForSetUserProfileExtensionTransaction.isLoading
            }
            prefix={
              userProfileExtension.organisations.includes(
                organisationAddress,
              ) ? (
                <StarOff size={20} />
              ) : (
                <Star size={20} />
              )
            }
            disabled={!account.isConnected}
            onClick={toggleStarOrganisation}
            variant="outline"
          >
            {userProfileExtension.organisations.includes(
              organisationAddress,
            ) ? (
              <span>Unstar</span>
            ) : (
              <span>Star</span>
            )}
          </Button>
        </ClientOnly>

        <Button asChild variant="outline">
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
      <div className="mt-3 mt-5 flex flex-col gap-1">
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
              className="border-b border-dashed border-[#999]"
              href={`https://testnet-explorer.thetatoken.org/account/${organisationAddress}`}
              target="_blank"
            >
              {organisationAddress ? shortenAddress(organisationAddress) : null}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
