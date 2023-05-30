import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/Button";
import { Settings, Star } from "lucide-react";

import DelegateModal from "@/components/DelegateModal";
import Proposals from "@/components/Proposals";
import { shortenAddress } from "@/utils/shorten-address";

const daos = {
  id: 1,
  name: "Aave",
  logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
  description:
    "Aave DAO is a community-driven governance model that enables token holders to propose and vote on changes to the Aave protocol on Ethereum.",
  passed: 12,
  failed: 12,
};

export default function OrganisationPage() {
  // get the governance contract address from route
  const router = useRouter();
  const govAddress = router.query.organisationAddress as `0x${string}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-black-500 rounded-lg p-5 mt-5">
        <div>
          <div className="flex md:flex-row md:justify-between items-center flex-col justify-center">
            <div className="flex flex-row items-center gap-5">
              <img src={daos.logo} width={40} height={40} alt="DAO image" />
              <h1 className="text-3xl font-bold">{daos.name}</h1>
            </div>
            <div className="flex flex-row gap-3 mt-5 md:mt-0 flex-wrap">
              <Link
                href={{
                  pathname: `${govAddress}/proposals/new`,
                }}
              >
                <Button variant="outline">Create proposal</Button>
              </Link>
              <DelegateModal />
              <Link
                href={{
                  pathname: `${govAddress}/settings`,
                }}
              >
                <Button>
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button>
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="">
            <div className="mt-6 max-w-3xl  text-center md:text-left">
              {daos.description}
            </div>
            <div className="mt-5">
              Governor
              <Link
                href={`https://explorer.thetatoken.org/account/${govAddress}`}
                target="_blank"
              >
                <span className="font-semibold text-slate-500 ml-2">
                  {govAddress ? shortenAddress(govAddress) : null}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-black-500 rounded-lg p-5">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold">Proposals</h1>
        </div>
        <hr className="my-3"></hr>
        <Proposals />
      </div>
    </div>
  );
}
