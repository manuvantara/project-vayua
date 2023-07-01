import ProfileSettings from '@/components/ProfileSettings';
import useOrganisationSettings from '@/hooks/use-organisation-settings';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function GovernanceProfile() {
  // As long as page's dynamic route is set to [organisationAddress], useRouter() will have the
  // following shape:
  const {
    organisationAddress,
  }: {
    organisationAddress?: `0x${string}` | undefined;
  } = useRouter().query;

  const { handleWrite, isLoading, isSuccess, isWriteLoading } =
    useOrganisationSettings(organisationAddress);

  return (
    <div>
      <Link
        className='inline-flex items-center text-muted-foreground'
        href={`/organisations/${organisationAddress}`}
      >
        <ArrowLeft className='mr-1 h-4 w-4' />
        Back
      </Link>
      <ProfileSettings
        address={organisationAddress}
        isTransactionInProgress={isLoading || isWriteLoading}
        isTransactionSuccessful={isSuccess}
        onSubmit={handleWrite}
        title='Edit DAO Indentity'
        type='dao'
      />
    </div>
  );
}
