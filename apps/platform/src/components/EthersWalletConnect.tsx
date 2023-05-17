import { Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { getProvider, updateProvider } from "@/config/ethers-connect";

interface ConnectWalletProps {
  walletConnected: boolean;
  setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

function EthersConnect({
  walletConnected,
  setWalletConnected,
}: ConnectWalletProps) {
  return (
    <>
      <Button
        color={walletConnected ? "ocean-blue" : "dark"}
        radius="md"
        onClick={async (event) => {
          if (!walletConnected) {
            await updateProvider();
            const connectedProvider = getProvider();
            if (connectedProvider) {
              setWalletConnected(true);
            } else {
              setWalletConnected(false);
              const isMobile = window.innerWidth < 768;
              const errorMessage = isMobile
                ? "Wallet has not been connected. Please connect your wallet on a larger screen device."
                : "Wallet has not been connected.";
              showNotification({
                title: "Error",
                color: "red",
                message: errorMessage,
                autoClose: 5000,
              });
            }
          }
        }}
      >
        {walletConnected ? <>Connected</> : <>Connect</>}
      </Button>
    </>
  );
}

export default EthersConnect;
