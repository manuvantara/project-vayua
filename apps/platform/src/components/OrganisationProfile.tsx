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
} from "lucide-react";
import DelegateModal from "./DelegateModal";
import { useContractRead } from "wagmi";
import {
  PROFILE_ABI,
  PROFILE_CONTRACT_ADDRESS,
} from "@/utils/abi/profile-contract";
import { useEffect, useState } from "react";
import { SettingsFormValues } from "@/types/forms";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import Image from "next/image";
import { getInitials } from "@/utils/shorten-name";

interface Profile {
  name: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  extra: string;
}

export default function OrganisationProfile({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const [profile, setProfile] = useState<SettingsFormValues>({
    name: "",
    bio: "",
    avatar: "",
    location: "",
    website: "",
    extra: "",
  });

  const profilesRead = useContractRead({
    address: PROFILE_CONTRACT_ADDRESS,
    abi: PROFILE_ABI,
    functionName: "profiles",
    args: [organisationAddress],
  });

  function isProfilish(data: unknown): data is string[] {
    return (
      Array.isArray(data) &&
      data.length === 6 &&
      data.every((element) => typeof element === "string")
    );
  }

  function parseProfile(data: unknown): Profile {
    if (!isProfilish(data)) {
      throw new Error("Cannot parse profile. Invalid data");
    }
    return {
      name: data[0],
      bio: data[1],
      avatar: data[2],
      location: data[3],
      website: data[4],
      extra: data[5],
    };
  }

  // let profile;
  // useEffect(() => {
  //   try {
  //     profile = parseProfile(profilesRead.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });

  useEffect(() => {
    const profileData: string[] = profilesRead?.data as string[];
    console.log("userProfileData", profileData);
    if (profileData) {
      setProfile({
        name: profileData[0],
        bio: profileData[1],
        avatar: profileData[2],
        location: profileData[3],
        website: profileData[4],
        extra: profileData[5],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilesRead?.data]);

  return (
    <div className="col-span-1 bg-white border border-black-500 rounded-lg p-5 mt-5">
      <div className="flex flex-row items-center gap-5 mb-5">
        <Avatar className="h-16 w-16">
          <AvatarImage
            className="object-top"
            decoding="async"
            loading="lazy"
            title={`Avatar for ${profile.name}`}
            src={profile.avatar || ""}
          />
          <AvatarFallback delayMs={300}>
            <Image
              src={`https://avatar.vercel.sh/${
                profile.name || "no-name"
              }.svg?text=${encodeURIComponent(
                getInitials(profile.name as string)
              )}`}
              width="80"
              height="80"
              alt={`Avatar for ${profile.name}`}
              className="select-none pointer-events-none rounded-full"
            />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">
          {profile.name == "" ? "..." : profile.name}
        </h1>
      </div>
      <div className="gap-2 grid grid-cols-2">
        <Button variant="outline" asChild>
          <Link
            href={{
              pathname: `${organisationAddress}/settings`,
            }}
          >
            <Settings size={20} />
            <span className="ml-2">Settings</span>
          </Link>
        </Button>

        <Button variant="outline">
          <Star size={20} />
          <span className="ml-2">Star</span>
        </Button>

        <Button variant="outline" asChild>
          <Link
            href={{
              pathname: `${organisationAddress}/proposals/new`,
            }}
          >
            <Plus size={20} />
            <span className="ml-2">Propose</span>
          </Link>
        </Button>
        <DelegateModal />
      </div>
      {profile.bio && <div className="mt-5 max-w-3xl">{profile.bio}</div>}
      <div className="mt-5 flex flex-col mt-3 gap-1">
        {profile.location && (
          <div className="flex flex-row items-center gap-2">
            <MapPin size={20} />
            <div>{profile.location}</div>
          </div>
        )}
        {profile.website && (
          <div className="flex flex-row items-center gap-2">
            <LinkIcon size={20} />
            <div>
              <Link href={profile.website as string}>{profile.website}</Link>
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
