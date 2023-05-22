import { Button } from "@/components/ui/Button";
import React from "react";
import DelegateModal from "../../components/DelegateModal";
import Proposals from "../../components/Proposals";
import Link from "next/link";

import dynamic from "next/dynamic";
const WagmiWalletConnect = dynamic(
  () => import("@/components/WagmiWalletConnect"),
  {
    ssr: false,
  }
);

const daos = {
  id: 1,
  name: "Aave",
  logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
  description:
    "Aave DAO is a community-driven governance model that enables token holders to propose and vote on changes to the Aave protocol on Ethereum.",
  passed: 12,
  failed: 12,
};

function PageDAO() {
  return (
    <div className="flex flex-col gap-6">
      <WagmiWalletConnect />
      <div className="bg-white border border-black-500 rounded-lg p-5">
        <div>
          <div className="flex md:flex-row md:justify-between items-center flex-col justify-center">
            <div className="flex flex-row items-center gap-6 mb-3 md:mb-0">
              <img src={daos.logo} width={40} height={40} alt="DAO image" />
              <h1 className="text-3xl font-bold">{daos.name}</h1>
            </div>
            <div className="flex flex-row gap-3">
              <Link href="/">
                <Button variant="outline">Create proposal</Button>
              </Link>
              <DelegateModal tokenAddress="0x91331BD31a527D2b289D075A6Db53cd448B6613C" />
            </div>
          </div>
          <div className="mt-4 text-center md:text-left">
            {daos.description}
          </div>
        </div>
      </div>
      <div className="bg-white border border-black-500 rounded-lg p-5">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold">Proposals</h1>
          <div className="flex flex-row gap-3">
            <div>
              {daos.passed} <text className="text-green-600">Passed</text>
            </div>
            <div>
              {daos.failed} <text className="text-red-600">Failed</text>
            </div>
          </div>
        </div>
        <hr className="my-3"></hr>
        <Proposals />
      </div>
    </div>
  );
}

export default PageDAO;