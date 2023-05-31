import React from "react";
import { Unplug, UserCog } from "lucide-react"
import ClientOnly from "@/components/ClientOnly";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

type WalletConnectedProps = {
  isConnected: boolean
};

export default function EmptyStateWithIcon({ isConnected } : WalletConnectedProps) {
  if(isConnected){
    return (
      <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
      <div className="text-center px-8 py-8">
        <UserCog className="h-10 w-10 mx-auto text-black" />
        <h3 className="mt-3 text-sm font-semibold text-gray-500">No profile</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started with setting up your profile
        </p>
        <div className="mt-4">
          <Link className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 aria-disabled:opacity-50 disabled:pointer-events-none aria-disabled:pointer-events-none disabled:cursor-not-allowed aria-disabled:cursor-not-allowed ring-offset-background aria-[busy=true]:opacity-50 aria-[busy=true]:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4" href="/settings">
              Set up profile
          </Link>
        </div>
      </div>
    </div>
    );
  }
  return (
    <div className="border rounded-lg shadow-sm bg-card text-card-foreground divide-y flex flex-col w-full">
      <div className="text-center px-8 py-8">
        <Unplug className="h-10 w-10 mx-auto text-black" />
        <h3 className="mt-3 text-sm font-semibold text-gray-500">Connect wallet to see your profile here</h3>
        <div className="mt-6 block">
          <ClientOnly>
              <WalletConnect />
          </ClientOnly>
        </div>
      </div>
    </div>
  );
  
}


