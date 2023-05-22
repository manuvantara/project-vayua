import { useConnect } from "wagmi";
import { Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { thetaTestnet } from "@/utils/chains/theta-chains";

function WagmiWalletConnect() {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: thetaTestnet.id,
    });

  useEffect(() => {
    if (error) {
      showNotification({
        title: "Error",
        color: "red",
        message: error.message,
        autoClose: 5000,
      });
    }
  }, [error]);

  return (
    <>
      {connectors.map((connector) => (
        <Button
          color="green"
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          Connect
          {!connector.ready && " (unsupported)"}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </Button>
      ))}
    </>
  );
}

export default WagmiWalletConnect;
