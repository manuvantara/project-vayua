import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { thetaTestnet } from "@/config/theta-chains";

const NETWORK = thetaTestnet.name;
const networkId = thetaTestnet.id;
const rpcLink = thetaTestnet.rpcUrls.default;

let provider: ethers.BrowserProvider | null = null; // null if updateProvider was not called or updateProvider didn't found the provider
let signer: ethers.Signer | null = null;
export async function updateProvider() {
  try {
    let rawProvider = await detectEthereumProvider();
    provider =
      rawProvider == null
        ? null
        : new ethers.BrowserProvider(rawProvider as any, networkId);
    if (provider == null) return;

    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: "0x" + networkId.toString(16) },
      ]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.error.code === 4902) {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0x" + networkId.toString(16),
              rpcUrls: [rpcLink],
              chainName: NETWORK,
              nativeCurrency: {
                name: "Theta Fuel",
                symbol: "TFUEL",
                decimals: 18,
              },
              blockExplorerUrls: null,
            },
          ]);
          await provider.send("wallet_switchEthereumChain", [
            { chainId: "0x" + networkId.toString(16) },
          ]);

          signer = await provider.getSigner();

          return;
        } catch (addError) {
          provider = null;
          return;
        }
        provider = null;
        return;
      }

      provider = null;
      return;
    }

    signer = await provider.getSigner();

    return;
  } catch {
    provider = null;
    return;
  }
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}
