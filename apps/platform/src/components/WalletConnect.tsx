import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import { shortenAddress } from '@/utils/helpers/shorten.helper';
import { Wallet } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi';
import { fantomTestnet } from 'wagmi/chains';

const connectorsIcons: { [key: string]: any } = {
  'Coinbase Wallet': '/icons/coinbase.svg',
  MetaMask: '/icons/metamask.svg',
  WalletConnect: '/icons/walletconnect.svg',
};

export default function WalletConnect() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const account = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: fantomTestnet.id,
      onSuccess: () => {
        setOpen(false);
      },
    });
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (error) {
      toast({
        description: error.message,
        variant: 'destructive',
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
        description: 'This connector is not ready yet.',
        variant: 'destructive',
      });
      return;
    }

    connect({ connector });
  };

  if (account.isConnected && account.address) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button className="border-0" prefix={<Wallet />} variant="outline">
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
          <Button onClick={handleDisconnect} variant="default">
            Disconnect
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button prefix={<Wallet />} variant="default">
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
                prefix={
                  <Image
                    alt={connector.name}
                    height={24}
                    src={iconPath}
                    width={24}
                  />
                }
                key={connector.id}
                loading={isLoading && connector.id === pendingConnector?.id}
                onClick={() => handleConnect(connector)}
                variant="outline"
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
