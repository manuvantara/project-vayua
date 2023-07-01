import WalletConnect from '@/components/WalletConnect';
import ClientOnly from '@/components/layout/ClientOnly';
import { Button } from '@/components/ui/Button';
import { Unplug, UserCog } from 'lucide-react';
import Link from 'next/link';

type WalletConnectedProps = {
  isConnected: boolean;
};

export default function EmptyStateWithIcon({
  isConnected,
}: WalletConnectedProps) {
  return (
    <div className='flex w-full flex-col divide-y rounded-lg border bg-card text-card-foreground shadow-sm'>
      <div className='px-8 py-8 text-center'>
        {isConnected ? (
          <>
            <UserCog className='mx-auto h-10 w-10 text-black' />
            <h3 className='mt-3 text-lg font-semibold'>No identity, yet!</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              Get started with setting up your identity.
            </p>
            <div className='mt-4'>
              <Button asChild>
                <Link href='/settings'>Set up your identity</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Unplug className='mx-auto h-10 w-10 text-black' />
            <h3 className='mt-2 text-base font-medium'>
              Connect wallet to see your identity
            </h3>
            <div className='mt-4 block'>
              <ClientOnly>
                <WalletConnect />
              </ClientOnly>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
