import type { GetServerSideProps } from 'next';

import DelegateModal from '@/components/DelegateModal';
import { ProposalsTable } from '@/components/ProposalsTable';
import { ProfileView } from '@/components/VRC1';
import ClientOnly from '@/components/layout/ClientOnly';
import { Button } from '@/components/ui/Button';
import { Card, CardFooter, CardHeader } from '@/components/ui/Card';
import useProposalsList from '@/hooks/use-proposals-list';
import {
  type OrganisationProfile,
  type UserStarringExtension,
  VRC1_CONTRACT_ABI,
  VRC1_CONTRACT_ADDRESS,
  parseProfile,
  parseUserStarringExtension,
} from '@/utils/VRC1';
import { GOVERNOR_ABI } from '@/utils/abi/openzeppelin-contracts';
import { columns } from '@/utils/helpers/proposal.helper';
import { Plus, Settings, Star, StarOff } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { createPublicClient, http } from 'viem';
import {
  useAccount,
  useContractEvent,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from 'wagmi';
import { fantom } from 'wagmi/chains';

export default function OrganisationPage({
  organisationAddress,
  parsedOrganisationProfile,
}: {
  organisationAddress: `0x${string}`;
  parsedOrganisationProfile: OrganisationProfile;
}) {
  const publicClient = usePublicClient();

  //const delegatee = useUserDelegatee(organisationAddress);

  const [proposals, scannedBlocksCounter, toScanBlocksCounter] =
    useProposalsList(organisationAddress);

  const [organisationProfile, setOrganisationProfile] =
    useState<OrganisationProfile>(parsedOrganisationProfile);

  const [userProfileExtension, setUserProfileExtension] =
    useState<UserStarringExtension>({
      organisations: [],
      standard: 'VRC1',
      target: 'User',
      version: '1.0.0',
    });

  const account = useAccount({
    async onConnect({ address }) {
      if (address) {
        const data = await publicClient.readContract({
          abi: VRC1_CONTRACT_ABI,
          address: VRC1_CONTRACT_ADDRESS,
          args: [address],
          functionName: 'profileExtensions',
        });

        const userProfileExtension = parseUserStarringExtension(data);
        console.log('userProfileExtension=', userProfileExtension);

        setUserProfileExtension(userProfileExtension);
      }
    },
  });

  const setProfileExtensionWrite = useContractWrite({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    functionName: 'setProfileExtension',
  });

  const waitForSetUserProfileExtensionTransaction = useWaitForTransaction({
    hash: setProfileExtensionWrite.data?.hash,
  });

  useContractEvent({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    eventName: 'ProfileExtensionChanged',
    listener: (logs) => {
      if (account.address) {
        const userLogs = logs.filter(
          (log) => log.args.profileOwner === account.address,
        );
        const latestLog = userLogs[userLogs.length - 1];

        if (latestLog.args.extension) {
          const latestExtension = parseUserStarringExtension(
            latestLog.args.extension,
          );
          setUserProfileExtension(latestExtension);
        }
      }

      console.log('UserProfileExtensionChanged=', logs);
    },
  });

  const toggleStarOrganisation = () => {
    const extension = userProfileExtension;

    let temp: UserStarringExtension;

    if (!extension.organisations.includes(organisationAddress)) {
      temp = {
        ...extension,
        organisations: [...extension.organisations, organisationAddress],
      };
    } else {
      temp = {
        ...extension,
        organisations: extension.organisations.filter(
          (element) => element !== organisationAddress,
        ),
      };
    }

    console.log('temp=', temp);

    setProfileExtensionWrite.write({
      args: [JSON.stringify(temp)],
    });
  };

  return (
    <div className='space-y-5 pt-8 lg:grid lg:grid-cols-3 lg:space-x-5 lg:space-y-0'>
      <Card className='grid'>
        <CardHeader>
          <div className='flex flex-col items-center'>
            <ProfileView
              accountAddress={organisationAddress}
              profile={organisationProfile}
            />
          </div>
        </CardHeader>
        {/* {delegatee && delegatee !== NULL_ADDRESS && (
          <ClientOnly>
            <CardContent className='flex space-x-2 border-t pt-6'>
              <ArrowRightCircle />
              <div className='col-span-2 text-gray-500'>
                Voting power delegated to{' '}
                <Link
                  href={`https://testnet.ftmscan.com/address/${delegatee}`}
                  target='_blank'
                >
                  {shortenAddress(delegatee, 4, 4)}
                </Link>
              </div>
            </CardContent>
          </ClientOnly>
        )} */}
        <CardFooter className='grid grid-cols-2 gap-4'>
          <Button
            asChild
            className='w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
          >
            <Link href={`${organisationAddress}/settings`}>
              <Settings size={20} />
              <span className='ml-2'>Settings</span>
            </Link>
          </Button>

          <ClientOnly>
            <Button
              loading={
                setProfileExtensionWrite.isLoading ||
                waitForSetUserProfileExtensionTransaction.isLoading
              }
              prefix={
                userProfileExtension.organisations.includes(
                  organisationAddress,
                ) ? (
                  <StarOff size={20} />
                ) : (
                  <Star size={20} />
                )
              }
              className='w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
              disabled={!account.isConnected}
              onClick={toggleStarOrganisation}
            >
              {userProfileExtension.organisations.includes(
                organisationAddress,
              ) ? (
                <span>Unstar</span>
              ) : (
                <span>Star</span>
              )}
            </Button>
          </ClientOnly>

          <Button
            asChild
            className='w-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-white hover:text-gray-900'
          >
            <Link href={`${organisationAddress}/proposals/new`}>
              <Plus size={20} />
              <span className='ml-2'>Propose</span>
            </Link>
          </Button>
          <DelegateModal organisationAddress={organisationAddress} />
        </CardFooter>
      </Card>
      {/* </OrganisationCard> */}
      <ProposalsTable
        columns={columns}
        data={proposals}
        organisationAddress={organisationAddress}
        scannedBlocksCounter={scannedBlocksCounter}
        toScanBlocksCounter={toScanBlocksCounter}
      />
    </div>
  );
}

// Using arrow function to infer type
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Better than useRouter hook because on the client side we will always have the address
  const organisationAddress = params?.organisationAddress as `0x${string}`;

  const publicClient = createPublicClient({
    chain: fantom,
    transport: http(),
  });

  try {
    // If there is no token, the contract will throw an error, and we will redirect to the 404 page
    await publicClient.readContract({
      abi: GOVERNOR_ABI,
      address: organisationAddress,
      functionName: 'token',
    });
  } catch {
    const query = new URLSearchParams({
      description:
        'It looks like the address you entered is not a valid organisation address.',
      message: 'Organisation not found',
    });

    return {
      redirect: {
        destination: `/invalid-organisation?${query}`,
        permanent: false,
      },
    };
  }

  const organisationProfile = await publicClient.readContract({
    abi: VRC1_CONTRACT_ABI,
    address: VRC1_CONTRACT_ADDRESS,
    args: [organisationAddress],
    functionName: 'profiles',
  });

  return {
    props: {
      organisationAddress,
      parsedOrganisationProfile: parseProfile(organisationProfile),
    },
  };
};
