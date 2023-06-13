import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Profile, UserStarringExtension, mockupProfile } from '@/utils/VRC1';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
// TODO: refactor, separate utils, <Profile /> & <UserStarringExtension>
import {
  ChevronRightIcon,
  Fingerprint,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

// type Profile = {
//   name?: string;
//   bio?: string;
//   avatar?: string;
//   location?: string;
//   website?: string;
// };

// type ProfileExtension = {
//   standard: "VRC1";
//   target: "User";
//   version: "1.0.0";
// };

// type UserProfileExtension = ProfileExtension & {
//   organisations: `0x${string}`[];
// };

// type UserProfile = Profile & { extension: UserProfileExtension };

// function parseProfile(
//   data: readonly [string, string, string, string, string]
// ): Profile {
//   const profile: Profile = {};

//   if (data[0].length > 0) {
//     profile.name = data[0];
//   }

//   if (data[1].length > 0) {
//     profile.bio = data[1];
//   }

//   if (data[2].length > 0) {
//     profile.avatar = data[2];
//   }

//   if (data[3].length > 0) {
//     profile.location = data[3];
//   }

//   if (data[4].length > 0) {
//     profile.website = data[4];
//   }

//   return profile;
// }

// function parseUserProfileExtension(data: string) {
//   let userProfileExtension: UserProfileExtension;

//   if (data.length === 0) {
//     userProfileExtension = {
//       standard: "VRC1",
//       target: "User",
//       version: "1.0.0",
//       organisations: [],
//     };
//   } else {
//     try {
//       userProfileExtension = JSON.parse(data);
//     } catch (error) {
//       throw new Error("Unknown profile extension");
//     }
//   }

//   return userProfileExtension;
// }

// export default function UserProfile() {

//   return (
//     <ClientOnly>
//       <div className="flex flex-col items-center">
//         {account.address && (
//           <Profile accountAddress={account.address} profile={userProfile} />
//         )}
//         {userProfile.extension.organisations.length > 0 && (
//           <UserStarringExtension extension={userProfile.extension} />
//         )}
//       </div>
//     </ClientOnly>
//   );
// }

type ProfileViewProps = { accountAddress: `0x${string}`; profile: Profile };

export const ProfileView: FC<ProfileViewProps> = ({
  accountAddress,
  profile,
}) => {
  const [name, bio, avatar, location, website] = mockupProfile();

  return (
    <div className="flex flex-col items-center gap-6">
      <Avatar className="h-60 w-60 border">
        <AvatarImage
          className="object-top"
          decoding="async"
          height={240}
          loading="lazy"
          src={profile.avatar}
          title={`Avatar for ${accountAddress}}`}
          width={240}
        />
        <AvatarFallback delayMs={300}>
          <Image
            alt={`Avatar for ${accountAddress}}`}
            className="pointer-events-none select-none rounded-full"
            height={240}
            src={avatar}
            width={240}
          />
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight md:text-2xl">
            <Fingerprint size={24} />{' '}
            {/* TODO: modify shortenText so it could be applied to short names that are longer than it is expected */}
            {/* { (profile.name) ? shortenText(profile.name, 20) : shortenText(name, 0)} */}
            {profile.name || name}
          </div>
          <div className="text-gray-500">
            <Link
              href={`https://explorer.thetatoken.org/account/${accountAddress}`}
            >
              {shortenAddress(accountAddress, 4, 4)}
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-center">
          <div className="text-gray-500">
            <PencilIcon className="inline-block align-text-top" size={16} />{' '}
            {profile.bio || bio}
          </div>

          <div className="text-gray-500">
            <MapPinIcon className="inline-block align-text-top" size={16} />{' '}
            {profile.location || location}
          </div>

          <div className="text-gray-500">
            <LinkIcon className="inline-block align-text-top" size={16} />{' '}
            <Link href={profile.website || website}>
              {profile.website || website}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

type UserStarringExtensionView = { extension: UserStarringExtension };

export const UserStarringExtensionView: FC<UserStarringExtensionView> = ({
  extension,
}) => (
  <ul className="grid grid-cols-1 divide-y text-gray-500 hover:text-primary">
    {extension.organisations.map((organisationAddress) => (
      <li key={organisationAddress}>
        <Link
          className="flex items-center justify-between py-4"
          href={`/organisations/${organisationAddress}`}
        >
          <span>{shortenAddress(organisationAddress)}</span>
          <ChevronRightIcon height={16} />
        </Link>
      </li>
    ))}
  </ul>
);
