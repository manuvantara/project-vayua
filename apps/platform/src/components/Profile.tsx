import Link from "next/link";
import EmptyStateWithIcon from "@/components/EmptyStateWithIcon";
import { LinkIcon, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { getInitials } from "@/utils/shorten-name";
import Image from "next/image";
import { useContractRead } from "wagmi";
import {
  PROFILE_ABI,
  PROFILE_CONTRACT_ADDRESS,
} from "@/utils/abi/profile-contract";
import { useEffect, useState } from "react";

type AddressProps = {
  address: `0x${string}` | undefined;
};

type UserData = {
  name: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  website: string | undefined;
  location: string | undefined;
  extra: string | undefined;
};

export default function Profile({ address }: AddressProps) {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    bio: "",
    avatar: "",
    website: "",
    location: "",
    extra: "",
  });

  const contractRead = useContractRead({
    address: PROFILE_CONTRACT_ADDRESS,
    abi: PROFILE_ABI,
    functionName: "profiles",
    args: [address],
  });

  useEffect(() => {
    const userProfileData: string[] = contractRead?.data as string[];
    if (contractRead.isSuccess) {
      setUserData({
        name: userProfileData[0],
        bio: userProfileData[1],
        avatar: userProfileData[2],
        website: userProfileData[4],
        location: userProfileData[3],
        extra: userProfileData[5],
      });
    }
  }, [contractRead?.data]);

  return contractRead.isSuccess && userData.name ? (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col divide-y w-auto md:text-base text-xs w-full">
      <div className="text-xl font-semibold px-5 pt-5 pb-3">Your Identity</div>
      <div className="font-light px-6 pt-3 pb-6">
        <div className="flex flex-row lg:justify-between gap-5 items-start w-full">
          <div className="w-20 h-20">
            <Avatar className="h-20 w-20">
              <AvatarImage
                className="object-top"
                decoding="async"
                loading="lazy"
                title={`Avatar for ${userData.name}`}
                src={userData.avatar || ""}
              />
              <AvatarFallback delayMs={300}>
                <Image
                  src={`https://avatar.vercel.sh/${
                    userData.name || "no-name"
                  }.svg?text=${encodeURIComponent(
                    getInitials(userData.name as string)
                  )}`}
                  width="80"
                  height="80"
                  alt={`Avatar for ${userData.name}`}
                  className="select-none pointer-events-none rounded-full"
                />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2 text-lg font-medium">
                <div>{userData.name}</div>
              </div>
              <div className="lg:w-96 w-full">{userData.bio}</div>
              <div className="flex flex-col mt-3 gap-1">
                <div className="flex flex-row items-center gap-2">
                  <MapPin />
                  <div>{userData.location}</div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <LinkIcon />
                  <div>
                    <Link href={userData.website as string}>
                      {userData.website}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full">
      <EmptyStateWithIcon isConnected={contractRead.isSuccess} />
    </div>
  );
}
