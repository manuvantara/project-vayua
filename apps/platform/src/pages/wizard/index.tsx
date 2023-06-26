import Stepper from '@/components/wizard/Stepper';
import { MantineProvider, type MantineThemeOverride } from '@mantine/core';

const theme: MantineThemeOverride = {
  colorScheme: 'light',
  fontFamily: 'var(--font-inter)',
  headings: {
    sizes: {
      h1: {
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: '3.5rem',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: '2.5rem',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: '2rem',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: '1.5rem',
      },
    },
  },
};

export default function Wizard() {
  return (
    <MantineProvider theme={theme}>
      <div className='flex flex-col'>
        <div className='flex items-center justify-start border-b'>
          <div className='my-8 flex items-center justify-between'>
            <h3 className='text-3xl font-medium tracking-tight md:text-4xl'>
              Vayua Wizard
            </h3>
          </div>
        </div>
        <Stepper />
        <style global jsx>{`
          body {
            background-color: #fafafa;
          }
        `}</style>
      </div>
    </MantineProvider>
  );
}
