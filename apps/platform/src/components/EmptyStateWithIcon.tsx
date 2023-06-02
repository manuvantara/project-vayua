import { Button } from "@/components/ui/Button";
import { Unplug, UserCog } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

type WalletConnectedProps = {
  isConnected: boolean;
};

export default function EmptyStateWithIcon({
  isConnected,
}: WalletConnectedProps) {
  return (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
      <div className="text-center px-8 py-8">
        {isConnected ? (
          <>
            <UserCog className="h-10 w-10 mx-auto text-black" />
            <h3 className="mt-3 text-lg font-semibold">
                No identity, yet!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started with setting up your identity.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/settings">Set up your identity</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Unplug className="h-10 w-10 mx-auto text-black" />
            <h3 className="mt-2 text-base font-medium">
              Connect wallet to see your identity
            </h3>
            <div className="mt-4 block">
              <ClientOnly>
                <WalletConnect />
              </ClientOnly>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
