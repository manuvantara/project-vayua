import type { FC } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import useMockupProfile from '@/hooks/use-mockup-profile';
import { type Profile, type UserStarringExtension } from '@/utils/VRC1';
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

type ProfileViewProps = {
  accountAddress: `0x${string}` | undefined;
  profile?: Profile | null;
};

export const ProfileView: FC<ProfileViewProps> = ({
  accountAddress,
  profile,
}) => {
  const { isLoading, mockupProfile } = useMockupProfile();

  // Just for now
  if (isLoading || !accountAddress || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className='flex flex-col items-center gap-6'>
      <Avatar className='h-60 w-60 border'>
        <AvatarImage
          className='object-top'
          decoding='async'
          height={240}
          loading='lazy'
          src={profile?.avatar}
          title={`Avatar for ${accountAddress}`}
          width={240}
        />
        <AvatarFallback delayMs={300}>
          <Image
            alt={`Avatar for ${accountAddress}}`}
            className='pointer-events-none select-none rounded-full'
            height={240}
            src={mockupProfile?.avatar!}
            width={240}
          />
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col items-center'>
          <div className='flex items-center gap-2 text-xl font-semibold leading-none tracking-tight md:text-2xl'>
            <Fingerprint size={24} />{' '}
            {/* TODO: modify shortenText so it could be applied to short names that are longer than it is expected */}
            {/* { (profile?.name) ? shortenText(profile?.name, 20) : shortenText(name, 0)} */}
            {profile?.name || mockupProfile?.name}
          </div>
          <div className='text-gray-500'>
            <Link
              href={`https://explorer.thetatoken.org/account/${accountAddress}`}
            >
              {shortenAddress(accountAddress, 4, 4)}
            </Link>
          </div>
        </div>

        <div className='flex flex-wrap justify-center gap-2 text-center'>
          <div className='text-gray-500'>
            <PencilIcon className='inline-block align-text-top' size={16} />{' '}
            {profile?.bio || mockupProfile?.bio}
          </div>

          <div className='text-gray-500'>
            <MapPinIcon className='inline-block align-text-top' size={16} />{' '}
            {profile?.location || mockupProfile?.location}
          </div>

          <div className='text-gray-500'>
            <LinkIcon className='inline-block align-text-top' size={16} />{' '}
            <Link href={profile?.website || mockupProfile?.website!}>
              {profile?.website || mockupProfile?.website}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton: FC = () => (
  <div className='flex flex-col items-center gap-6'>
    <Skeleton className='h-60 w-60 rounded-full border' />
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col items-center'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-10 rounded-full' />
          <Skeleton className='h-8 w-24 rounded-full' />
        </div>
        <div className='mt-4'>
          <Skeleton className='h-6 w-24 rounded-full' />
        </div>
      </div>

      <div className='flex flex-wrap justify-center gap-2 text-center'>
        <Skeleton className='h-6 w-32 rounded-full' />
        <Skeleton className='h-6 w-32 rounded-full' />
        <Skeleton className='h-6 w-32 rounded-full' />
      </div>
    </div>
  </div>
);

type UserStarringExtensionView = { extension: UserStarringExtension };

export const UserStarringExtensionView: FC<UserStarringExtensionView> = ({
  extension,
}) => (
  <ul className='grid grid-cols-1 divide-y text-gray-500 hover:text-primary'>
    {extension.organisations.map((organisationAddress) => (
      <li key={organisationAddress}>
        <Link
          className='flex items-center justify-between py-4'
          href={`/organisations/${organisationAddress}`}
        >
          <span>{shortenAddress(organisationAddress)}</span>
          <ChevronRightIcon height={16} />
        </Link>
      </li>
    ))}
  </ul>
);
