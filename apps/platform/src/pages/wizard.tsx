import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import Stepper from "@/components/wizard/Stepper";

const theme: MantineThemeOverride = {
  colorScheme: "light",
  fontFamily: "var(--font-inter)",
  headings: {
    sizes: {
      h1: {
        fontSize: "3rem",
        fontWeight: 700,
        lineHeight: "3.5rem",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        lineHeight: "2.5rem",
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: "2rem",
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: "1.5rem",
      },
    },
  },
};

export default function Home() {
  return (
    <MantineProvider theme={theme}>
      <div className="flex flex-col">
        <div className="border-b flex items-center justify-start">
          <div className="flex justify-between items-center my-8">
            <h3 className="md:text-4xl text-3xl font-medium tracking-tight">
              Vayua Wizard
            </h3>
          </div>
        </div>
        {/*<Introduction />*/}
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
