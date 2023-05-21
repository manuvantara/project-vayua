"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

function DelegateModal() {
  const [showDelegate, setShowDelegate] = useState(true);
  const [showDelegateSomeone, setShowDelegateSomeone] = useState(false);

  const handleDelegateDialog = () => {
    setShowDelegate(true);
    setShowDelegateSomeone(false);
  };

  const handleDelegateSomeoneButton = () => {
    setShowDelegate((showDelegate) => !showDelegate);
    setShowDelegateSomeone((showDelegateSomeone) => !setShowDelegateSomeone);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleDelegateDialog}>
          Delegate
        </Button>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={handleDelegateSomeoneButton}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle>Delegate voting power</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showDelegate ? (
            <>
              <Button variant="outline">Myself</Button>
              <Button variant="outline" onClick={handleDelegateSomeoneButton}>
                To someone
              </Button>
            </>
          ) : (
            <>
              <Label htmlFor="address">Token address</Label>
              <Input id="address" type="text" placeholder="Enter an ETH" />
              <Button>Delegate votes</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DelegateModal;
