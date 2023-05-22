import { useConnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";
import { thetaTestnet } from "@/utils/chains/theta-chains";
import { useToast } from "@/components/ui/use-toast";

function WagmiWalletConnect() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: thetaTestnet.id,
    });

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <>
      {connectors.map((connector) => (
        <Button
          variant="default"
          loading={isLoading && connector.id === pendingConnector?.id}
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          Connect
        </Button>
      ))}
    </>
  );
}

export default WagmiWalletConnect;
