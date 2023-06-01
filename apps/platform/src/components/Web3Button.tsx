import { forwardRef } from "react";
import { useAccount } from "wagmi";
import { Button, type ButtonProps } from "@/components/ui/Button";
import ClientOnly from "@/components/ClientOnly";
import WalletConnect from "@/components/WalletConnect";

export default forwardRef<HTMLButtonElement, ButtonProps>(function Web3Button(
  props,
  ref
) {
  const { isConnected } = useAccount();

  return (
    // Do not remove this ClientOnly component. It is required to prevent hydration errors.
    <ClientOnly>
      {isConnected ? (
        <Button {...props} ref={ref}>
          {props.children}
        </Button>
      ) : (
        <WalletConnect />
      )}
    </ClientOnly>
  );
});
