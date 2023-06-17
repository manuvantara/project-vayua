import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className='grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8'>
      <div className='text-center'>
        <p className='text-base font-semibold text-success-dark'>404</p>
        <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
          {router.query?.message || 'Page not found'}
        </h1>
        <p className='mt-6 text-base leading-7 text-gray-600'>
          {router.query?.description ||
            'Sorry, we couldn’t find the page you’re looking for.'}
        </p>
        <div className='mt-10 flex items-center justify-center gap-x-6'>
          <Button
            asChild
            className='rounded-md bg-success text-white hover:bg-success-light'
            variant='secondary'
          >
            <Link href='/'>Go back home</Link>
          </Button>
          <Link
            className='flex items-center text-sm font-semibold'
            href='/docs'
          >
            Documentation
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </div>
      </div>
    </main>
  );
}
