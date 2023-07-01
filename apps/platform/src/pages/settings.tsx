import ProfileSettings from '@/components/ProfileSettings';
import useUserSettings from '@/hooks/use-user-settings';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function ProfileSettingsPage() {
  const { address } = useAccount();

  const { handleWrite, isLoading, isSuccess, isWriteLoading } =
    useUserSettings();

  return (
    <div>
      <Link
        className='inline-flex items-center text-muted-foreground'
        href={`/`}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        Back
      </Link>
      <ProfileSettings
        address={address as `0x${string}`}
        isTransactionInProgress={isWriteLoading || isLoading}
        isTransactionSuccessful={isSuccess}
        onSubmit={handleWrite}
        title='Edit Identity'
        type='user'
      />
    </div>
  );
}
