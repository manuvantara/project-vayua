import { ProfileView, UserStarringExtensionView } from '@/components/VRC1';
import ClientOnly from '@/components/layout/ClientOnly';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import useUserProfile from '@/hooks/use-user-profile';
import { SparklesIcon } from 'lucide-react';
import { useRouter } from 'next/router';

export default function UserProfile() {
  const {
    address,
  }: {
    address?: `0x${string}` | undefined;
  } = useRouter().query;

  const userProfile = useUserProfile(address);

  return (
    <div>
      <div className='mb-8 flex items-center justify-center border-b'>
        <div className='my-8 flex items-center justify-between'>
          <h3 className='text-3xl font-medium tracking-tight md:text-4xl'>
            Vayua Identity
          </h3>
        </div>
      </div>
      <div className='flex flex-col justify-center gap-5 md:flex-row'>
        {/* <ProfileCard> */}
        <Card className='md:max-w-sm'>
          <CardHeader>
            <ProfileView accountAddress={address} profile={userProfile} />
          </CardHeader>
        </Card>
        {/* </ProfileCard> */}
        {/* <UserStarringExtensionViewCard> */}
        <Card className='md:max-w-sm'>
          <CardHeader className='h-full rounded-t-lg'>
            <SparklesIcon size={32} />
            <CardTitle className='text-xl md:text-2xl'>
              User Starring Extension
            </CardTitle>
            <CardDescription>
              A tool that enables users to bookmark or highlight organizations
              they want to remember.
            </CardDescription>
            <ClientOnly>
              {userProfile &&
                userProfile.extension.organisations.length > 0 && (
                  <UserStarringExtensionView
                    extension={userProfile.extension}
                  />
                )}
            </ClientOnly>
          </CardHeader>
        </Card>
        {/* </UserStarringExtensionViewCard> */}
      </div>
    </div>
  );
}
