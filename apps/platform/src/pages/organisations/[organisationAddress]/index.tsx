import type { GetServerSideProps } from "next";
import Proposals from "@/components/Proposals";
import OrganisationProfile from "@/components/OrganisationProfile";
import { GOVERNOR_ABI } from "@/utils/abi/openzeppelin-contracts";
import { createPublicClient, http } from "viem";
import { thetaTestnet } from "@/utils/chains/theta-chains";

export default function OrganisationPage({
  organisationAddress,
}: {
  organisationAddress: `0x${string}`;
}) {
  // const router = useRouter();

  // const contractRead = useContractRead({
  //   address: organisationAddress,
  //   abi: GOVERNOR_ABI,
  //   functionName: "token",
  // });

  // useEffect(() => {
  //   if (contractRead.isError) {
  //     router.replace(
  //       {
  //         pathname: "/404",
  //         query: {
  //           message: "Organisation not found",
  //           description:
  //             "It looks like the address you entered is not a valid organisation address.",
  //         },
  //       },
  //       "/invalid-organisation"
  //     );
  //   }
  // }, [contractRead.isError]);

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

  const publicClient = createPublicClient({
    chain: thetaTestnet,
    transport: http(),
  });

  try {
    // If there is no token, the contract will throw an error and we will redirect to the 404 page
    await publicClient.readContract({
      address: organisationAddress,
      abi: GOVERNOR_ABI,
      functionName: "token",
    });
  } catch {
    const query = new URLSearchParams({
      message: "Organisation not found",
      description:
        "It looks like the address you entered is not a valid organisation address.",
    });

    return {
      redirect: {
        destination: `/invalid-organisation?${query}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      organisationAddress,
    },
  };
};
