// "use client";

// import {
//   baseURLBin,
//   compile,
//   CompilerAbstract,
//   pathToURL,
// } from "@remix-project/remix-solidity";
// import { useEffect, useState } from "react";
// import { SOLIDITY_COMPILER_VERSION, TEST_CONTRACTS } from "./configurations";
// import { showNotification } from "@mantine/notifications";
//
// const CONTRACT_NAME_REGEX = /contract\s(\S+)\s/;
// (function initSupportedSolcVersion() {
//   (pathToURL as any)["soljson-v0.8.11+commit.d7f03943.js"] = baseURLBin;
// })();

import Stepper from "@/app/Stepper";

export default function Home() {
  // Compiler
  // const [source, setSource] = useState(TEST_CONTRACTS[0].content);
  // const [compiling, setCompiling] = useState(false);
  // const [contractName, setContractName] = useState("");
  // const [compileResult, setCompileResult] = useState<CompilerAbstract>();
  // useEffect(() => {
  //   if (source) {
  //     const matches = CONTRACT_NAME_REGEX.exec(source);
  //     if (matches && matches[1]) {
  //       setContractName(matches[1]);
  //     }
  //   }
  // }, [source]);
  //
  // const handleCompile = async () => {
  //   setCompiling(true);
  //   try {
  //     const response = (await compile(
  //       {
  //         [contractName + ".sol"]: {
  //           content: source,
  //         },
  //       },
  //       {
  //         version: SOLIDITY_COMPILER_VERSION,
  //       },
  //       {}
  //     )) as CompilerAbstract;
  //
  //     if (response.data.errors) {
  //       showNotification({
  //         title: "Error",
  //         color: "red",
  //         message: response.data.errors[0].formattedMessage,
  //         autoClose: 5000,
  //       });
  //       return;
  //     }
  //     showNotification({
  //       color: "teal",
  //       title: "Complied successfully",
  //       message: "Check console.log for compilation result",
  //       autoClose: 5000,
  //     });
  //     console.log("All contract compileResult: ", response);
  //     setCompileResult(response);
  //   } finally {
  //     setCompiling(false);
  //   }
  // };

  return (
    <>
      <h1 className="mx-auto max-w-4xl py-20 text-center font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        Welcome to the Wizard
      </h1>
      <Stepper />
      {/*<Notifications />*/}
      {/*<main className="flex min-h-screen flex-col items-center justify-evenly p-24">*/}
      {/*  Compiler*/}
      {/*  <Button*/}
      {/*    variant="outline"*/}
      {/*    onClick={handleCompile}*/}
      {/*    disabled={!source}*/}
      {/*    loading={compiling}*/}
      {/*  >*/}
      {/*    Compile contract*/}
      {/*  </Button>*/}
      {/*</main>*/}
    </>
  );
}
