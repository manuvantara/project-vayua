import type { GetServerSideProps } from "next";
import Proposals from "@/components/Proposals";
import OrganisationProfile from "@/components/OrganisationProfile";
import { useContractRead } from "wagmi";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OrganisationPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  const router = useRouter();

  const contractRead = useContractRead({
    address: organisationAddress,
    abi: GOVERNOR_ABI,
    functionName: "token",
  });

  useEffect(() => {
    if (contractRead.isError) {
      router.push("/404");
    }
  }, [contractRead.isError]);

  return (
    <div className="lg:grid lg:grid-cols-3 gap-5">
      <OrganisationProfile organisationAddress={organisationAddress} />
      <Proposals organisationAddress={organisationAddress} />
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  return {
    props: {
      organisationAddress,
    },
  };
};
