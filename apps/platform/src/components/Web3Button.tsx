import { useAccount } from "wagmi";
import { Button, type ButtonProps } from "@/components/ui/Button";
import ClientOnly from "@/components/ClientOnly";
import WalletConnect from "@/components/WalletConnect";

export default function Web3Button(props: ButtonProps) {
  const { isConnected } = useAccount();

  return (
    // Do not remove this ClientOnly component. It is required to prevent hydration errors.
    <ClientOnly>
      {isConnected ? (
        <Button {...props}>{props.children}</Button>
      ) : (
        <WalletConnect />
      )}
    </ClientOnly>
  );
}
