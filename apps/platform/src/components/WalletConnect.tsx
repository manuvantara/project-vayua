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
import { shortenAddress } from "@/utils/shorten-address";

export default function WalletConnect() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const { connector: activeConnector, isConnected, address } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: thetaTestnet.id,
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
    connect({ connector });
    setOpen(false);
  };

  if (isConnected) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">{shortenAddress(address as string)}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Wallet</DialogTitle>
            <DialogDescription>
              Do you want to disconnect your wallet?
            </DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Connect</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wallet Connect</DialogTitle>
          <DialogDescription>
            Please connect your wallet to continue using the app.
          </DialogDescription>
        </DialogHeader>
        {connectors.map((connector) => (
          <Button
            variant="outline"
            loading={isLoading && connector.id === pendingConnector?.id}
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => handleConnect(connector)}
          >
            {connector.name}
          </Button>
        ))}
      </DialogContent>
    </Dialog>
  );
}
