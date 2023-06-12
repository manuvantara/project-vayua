import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { thetaTestnet } from "@/utils/chains/theta-chains";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { shortenAddress } from "@/utils/helpers/shorten.helper";
import Image from "next/image";
import { Wallet } from "lucide-react";

const connectorsIcons: { [key: string]: any } = {
  MetaMask: "/icons/metamask.svg",
  "Coinbase Wallet": "/icons/coinbase.svg",
  WalletConnect: "/icons/walletconnect.svg",
};

export default function WalletConnect() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const account = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: thetaTestnet.id,
      onSuccess: () => {
        setOpen(false);
      },
    });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (error) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleDisconnect = () => {
    disconnect();
    setOpen(false);
  };

  const handleConnect = (connector: Connector) => {
    if (!connector.ready) {
      toast({
        description: "This connector is not ready yet.",
        variant: "destructive",
      });
      return;
    }

    connect({ connector });
  };

  if (account.isConnected && account.address) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-0" prefix={<Wallet />}>
            {shortenAddress(account.address, 4, 4)}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect</DialogTitle>
            <DialogDescription>
              Do you want to disconnect your wallet?
            </DialogDescription>
          </DialogHeader>
          <Button variant="default" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" prefix={<Wallet />}>
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect</DialogTitle>
          <DialogDescription>
            Please connect your wallet to continue using the app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          {connectors.map((connector) => {
            const iconPath = connectorsIcons[connector.name];

            return (
              <Button
                variant="outline"
                loading={isLoading && connector.id === pendingConnector?.id}
                key={connector.id}
                onClick={() => handleConnect(connector)}
                prefix={
                  <Image
                    src={iconPath}
                    width={24}
                    height={24}
                    alt={connector.name}
                  />
                }
              >
                <span className="flex items-center space-x-2">
                  <span>{connector.name}</span>
                </span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
