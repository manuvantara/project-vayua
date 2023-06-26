import WalletConnect from '@/components/WalletConnect';
import ClientOnly from '@/components/layout/ClientOnly';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/utils/helpers/class-merge.helper';
import Link from 'next/link';

export default function Header() {
  const scrolled = useScroll(0);

  return (
    <div
      className={cn(
        'sticky top-0 z-50 flex w-full max-w-full justify-center bg-transparent transition-all duration-300 before:absolute before:-top-[1px] before:-z-[1] before:h-full before:w-full before:opacity-0 before:backdrop-blur-sm before:backdrop-saturate-150 before:transition-all before:duration-300 before:ease-in-out',
        {
          'bg-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)] before:opacity-100 sm:bg-white/80':
            scrolled,
        },
      )}
    >
      <header className='container flex h-16 w-full items-center justify-between py-4'>
        <div className='flex h-full items-center justify-between'>
          <Link href='/'>
            <svg
              className='h-8 w-auto'
              fill='none'
              viewBox='0 0 357 87'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M137.2 60.4H145.6L165.9 9.5H159L142.5 53.9H141.2L141.1 53.6L124.6 9.5H117.4L137.2 60.4Z'
                fill='#231F20'
              />
              <path
                d='M204.7 26.1C204 24.6 202.6 23.5 200.5 22.8C198.4 22.2 195.1 21.8 190.7 21.8C186.6 21.8 181.9 22 176.8 22.5V27C181.5 26.4 185.8 26.1 189.7 26.1C192.2 26.1 194.2 26.3 195.5 26.6C196.9 26.9 197.9 27.5 198.5 28.4C199.1 29.2 199.4 30.4 199.4 31.9V38.4H187.5C183.9 38.4 181.1 38.7 179.1 39.4C177.2 40.1 175.9 41.2 175.1 42.7C174.3 44.3 173.9 46.5 173.9 49.3C173.9 52.5 174.3 55 175.2 56.7C176 58.4 177.4 59.5 179.3 60.2C181.2 60.9 184.1 61.2 187.7 61.2C194.6 61.2 198.4 59.8 199 57L199.7 57.1V60.4H205.9V33.6C205.9 30.2 205.5 27.7 204.7 26.1ZM199.5 53C199.5 54.9 198.2 56.2 195.6 56.7C193.8 57.1 191.5 57.3 188.9 57.3H187.5C185.5 57.3 184.1 57.1 183 56.6C182 56.1 181.2 55.3 180.8 54.2C180.4 53.1 180.2 51.6 180.2 49.7C180.2 47.5 180.4 46 180.7 45C181.1 43.9 181.8 43.2 182.9 42.8C184 42.4 185.6 42.3 188 42.3H199.5V53Z'
                fill='#231F20'
              />
              <path
                d='M224.3 77H231L250.1 22.6H243.7L234 54.1H233.3L233.2 53.9L222.5 22.6H215.5L230.3 61.4L230.2 61.5L224.3 77Z'
                fill='#231F20'
              />
              <path
                d='M259.7 22.6V50.5C259.7 54.2 260.7 56.9 262.6 58.6C264.5 60.3 267.9 61.2 272.8 61.2C280.3 61.2 284.5 59.5 285.1 56L285.8 56.1V60.4H292.2V22.6H285.8V51.3C285.8 53.4 285 54.9 283.3 55.7C281.6 56.5 278.9 56.9 274.8 56.9C270.9 56.9 268.5 56.2 267.5 54.7C267 54 266.7 53.4 266.5 52.7C266.3 52 266.2 51.2 266.2 50.2V22.6H259.7Z'
                fill='#231F20'
              />
              <path
                d='M335.9 26.1C335.2 24.6 333.8 23.5 331.7 22.8C329.6 22.2 326.3 21.8 321.9 21.8C317.8 21.8 313.1 22 308 22.5V27C312.7 26.4 317 26.1 320.9 26.1C323.4 26.1 325.4 26.3 326.7 26.6C328.1 26.9 329.1 27.5 329.7 28.4C330.3 29.2 330.6 30.4 330.6 31.9V38.4H318.7C315.1 38.4 312.3 38.7 310.3 39.4C308.4 40.1 307.1 41.2 306.3 42.7C305.5 44.3 305.1 46.5 305.1 49.3C305.1 52.5 305.5 55 306.4 56.7C307.2 58.4 308.6 59.5 310.5 60.2C312.4 60.9 315.3 61.2 318.9 61.2C325.8 61.2 329.6 59.8 330.2 57L330.9 57.1V60.4H337.1V33.6C337.1 30.2 336.7 27.7 335.9 26.1ZM330.7 53C330.7 54.9 329.4 56.2 326.8 56.7C325 57.1 322.7 57.3 320.1 57.3H318.7C316.7 57.3 315.3 57.1 314.2 56.6C313.2 56.1 312.4 55.3 312 54.2C311.6 53.1 311.4 51.6 311.4 49.7C311.4 47.5 311.6 46 311.9 45C312.3 43.9 313 43.2 314.1 42.8C315.2 42.4 316.8 42.3 319.2 42.3H330.7V53Z'
                fill='#231F20'
              />
              <path
                d='M63.5 61V36.9H85.7V52H71V44H79.5'
                stroke='#2F62F2'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeMiterlimit='10'
                strokeWidth='4'
              />
              <path
                d='M51.7 61V36.9H29.5V52H44.2V44H35.7'
                stroke='#2F62F2'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeMiterlimit='10'
                strokeWidth='4'
              />
              <path
                d='M86.8 25.3H28.5'
                stroke='#2F62F2'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeMiterlimit='10'
                strokeWidth='4'
              />
              <path
                d='M95.3 15.8H19.9'
                stroke='#2F62F2'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeMiterlimit='10'
                strokeWidth='4'
              />
            </svg>
          </Link>
        </div>
        <div>
          <ClientOnly>
            <WalletConnect />
          </ClientOnly>
        </div>
      </header>
    </div>
  );
}
