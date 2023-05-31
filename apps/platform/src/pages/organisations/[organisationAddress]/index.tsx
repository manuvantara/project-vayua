import type { GetServerSideProps } from "next";
import Proposals from "@/components/Proposals";
import OrganisationProfile from "@/components/OrganisationProfile";

const daos = {
  id: 1,
  name: "Aave",
  logo: "https://www.tally.xyz/_next/image?url=https%3A%2F%2Fstatic.tally.xyz%2Fde0e6dc7-1c07-4ae4-9f42-e46367984fd2_original.png&w=384&q=75",
  description:
    "Aave DAO is a community-driven governance model that enables token holders to propose and vote on changes to the Aave protocol on Ethereum.",
  passed: 12,
  failed: 12,
};

export default function OrganisationPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
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
