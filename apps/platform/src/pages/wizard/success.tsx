import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
import { ArrowRight, Coins, Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getAddress } from 'viem';

export default function Success() {
  const router = useRouter();
  const { governanceAddress, tokenAddress } = router.query;

  useEffect(() => {
    const validateAddresses = () => {
      try {
        if (governanceAddress && tokenAddress) {
          // If the addresses are invalid, the function will throw an error
          const convertedGovernanceAddress = getAddress(
            governanceAddress.toString(),
          );
          const convertedTokenAddress = getAddress(tokenAddress.toString());

          // If the addresses are valid, we can return early and not redirect
          if (convertedGovernanceAddress && convertedTokenAddress) {
            return;
          }
        } else {
          // If the addresses are undefined (e.g. route is /wizard/success) and router is ready, we redirect to the wizard
          router.isReady && router.push('/wizard');
        }
      } catch {
        console.log('Invalid addresses');
        // If the addresses are invalid, we redirect to the wizard
        router.push('/wizard');
      }
    };

    validateAddresses();
  }, [governanceAddress, router, tokenAddress]);

  return (
    <div className='mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6 sm:py-24 lg:px-8'>
      <div className='max-w-xl'>
        <h1 className='flex gap-1 font-medium text-success'>
          Thank you!
          <span aria-label='party' role='img'>
            🎉
          </span>
        </h1>
        <p className='mt-2 text-5xl font-bold tracking-tight'>
          Addresses acquired!
        </p>
        <p className='mt-2 text-base text-muted-foreground'>
          Your DAO has been deployed and is ready to use. You can now share the
          address of your DAO with your community.
        </p>
      </div>
      <section className='mt-10 border-t'>
        <h2 className='sr-only'>Your Contracts</h2>
        <div className='flex gap-x-4 border-b py-10'>
          <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-t from-success to-success-lighter p-4 text-white shadow-2xl'>
            <Coins className='h-8 w-8' />
          </span>
          <div>
            <h4 className='font-medium'>Token contract</h4>
            <div className='mt-2 flex items-center gap-x-2'>
              <div className='text-muted-foreground'>
                {tokenAddress ? (
                  shortenAddress(tokenAddress.toString())
                ) : (
                  <Skeleton className='h-6 w-48' />
                )}
              </div>
              <CopyButton value={tokenAddress?.toString() || ''} />
            </div>
          </div>
        </div>
        <div className='flex gap-x-4 py-10'>
          <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-t from-success to-success-lighter p-4 text-white shadow-2xl'>
            <Scale className='h-8 w-8' />
          </span>
          <div>
            <h4 className='font-medium'>Governance contract</h4>
            <div className='mt-2 flex items-center gap-x-2'>
              <div className='text-muted-foreground'>
                {governanceAddress ? (
                  shortenAddress(governanceAddress.toString())
                ) : (
                  <Skeleton className='h-6 w-48' />
                )}
              </div>
              <CopyButton value={governanceAddress?.toString() || ''} />
            </div>
          </div>
        </div>
      </section>
      <Button asChild className='mt-4' variant='default'>
        <Link href={`/organisations/${governanceAddress?.toString()}`}>
          Continue to organisation
          <ArrowRight className='ml-2 h-4 w-4' />
        </Link>
      </Button>
    </div>
  );
}
