"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

interface Currency {
  name: string;
  symbol: string;
  icon: string;
}

interface Network {
  name: string;
  id: string;
}

const currencies: Currency[] = [
  { name: "Bitcoin", symbol: "BTC", icon: "bitcoin.svg" },
  { name: "Ethereum", symbol: "ETH", icon: "ethereum.svg" },
  { name: "Solana", symbol: "SOL", icon: "solana.svg" },
  { name: "BNB", symbol: "BNB", icon: "bnb.svg" },
  { name: "Dogecoin", symbol: "DOGE", icon: "dogecoin.svg" },
  { name: "Tether", symbol: "USDT", icon: "tether.svg" },
  { name: "Tron", symbol: "TRX", icon: "tron.svg" },
  { name: "Litecoin", symbol: "LTC", icon: "litecoin.svg" },
];

const networks: { [key: string]: Network[] } = {
  ETH: [
    { name: "Ethereum (ERC20)", id: "eth-main" },
    { name: "BSC (BEP20)", id: "bsc" },
    { name: "Arbitrum One", id: "aone" },
    { name: "Op Mainnet", id: "opmain" },
    { name: "Base Mainnet", id: "basemain" },
  ],
  BTC: [{ name: "Bitcoin", id: "btc-main" }],
  SOL: [{ name: "Solana", id: "sol-main" }],
  BNB: [{ name: "BSC (BEP20)", id: "bnb-main" }],
  USDT: [
    { name: "Ethereum (ERC20)", id: "usdt-eth" },
    { name: "Tron (TRC20)", id: "usdt-tron" },
    { name: "BSC (BEP20)", id: "usdt-bsc" },
    { name: "Arbitrum One", id: "usdt-aone" },
    { name: "Op Mainnet", id: "usdt-opm" },
    { name: "Solana", id: "usdt-sol" },
  ],
  DOGE: [{ name: "Dogecoin", id: "doge-main" }],
  TRX: [{ name: "Tron (TRC20)", id: "trx-main" }],
  LTC: [{ name: "Litecoin", id: "ltc-main" }],
};

const walletAddresses: { [key: string]: string } = {
  "eth-main": "0x551687309605e1abd8e5676f9627f80cac397e17",
  bsc: "0x551687309605e1abd8e5676f9627f80cac397e17",
  aone: "0x551687309605e1abd8e5676f9627f80cac397e17",
  opmain: "0x551687309605e1abd8e5676f9627f80cac397e17",
  basemain: "0x551687309605e1abd8e5676f9627f80cac397e17",
  "btc-main": "1AkDYZ6sssje3dXTb4WNYJFpuvdFa2v3bf",
  "sol-main": "DXTjqYXxqVWXmYmAE4cgFUgXhVMgy5cg5CowsuL89Se4",
  "bnb-main": "0x551687309605e1abd8e5676f9627f80cac397e17",
  "doge-main": "DAbfcb9WjDCT2GGZFr1zkdJ7mCmxZ6XiKX",
  "usdt-eth": "0x551687309605e1abd8e5676f9627f80cac397e17",
  "usdt-tron": "TVSsvW7P7ejphh9kgi8foCV1Tur4egmt3u",
  "usdt-bsc": "0x551687309605e1abd8e5676f9627f80cac397e17",
  "usdt-aone": "0x551687309605e1abd8e5676f9627f80cac397e17",
  "usdt-opm": "0x551687309605e1abd8e5676f9627f80cac397e17",
  "usdt-sol": "DXTjqYXxqVWXmYmAE4cgFUgXhVMgy5cg5CowsuL89Se4",
  "trx-main": "TVSsvW7P7ejphh9kgi8foCV1Tur4egmt3u",
  "ltc-main": "LhxiZjqS7upcjknvXyNPyHqpRmFbmnCDDE",
};

export default function DonatePage() {
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const handleCurrencySelect = (value: string) => {
    setSelectedCurrency(value);
    setStep(2);
  };

  const handleNetworkSelect = (value: string) => {
    setSelectedNetwork(value);
    setStep(3);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="container mx-auto min-h-screen max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Support Our Project
      </h1>

      <Card className="w-full">
        <CardContent className="pt-6">
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="mb-4 text-xl font-semibold">Choose currency</h2>
              <Select
                onValueChange={handleCurrencySelect}
                value={selectedCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => {
                    return (
                      <SelectItem
                        key={`currency-${currency.symbol}`}
                        value={currency.symbol}
                      >
                        <span className="flex items-center gap-2">
                          <span>
                            <img
                              src={`/svgs/${currency.icon}`}
                              alt={currency.name}
                              width={20}
                              height={20}
                            />
                          </span>
                          {currency.name} ({currency.symbol})
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {step >= 2 && selectedCurrency && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-4"
            >
              <h2 className="mb-4 text-xl font-semibold">Choose network</h2>
              <Select
                onValueChange={handleNetworkSelect}
                value={selectedNetwork}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a network" />
                </SelectTrigger>
                <SelectContent>
                  {networks[selectedCurrency]?.map((network) => {
                    return (
                      <SelectItem
                        key={`network-${network.id}`}
                        value={network.id}
                      >
                        {network.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {step >= 3 && selectedNetwork && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-6"
            >
              <div className="text-center">
                <h2 className="mb-4 text-xl font-semibold">
                  Send {selectedCurrency} to this address
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="break-all rounded-lg bg-muted p-2 font-mono text-sm">
                    {walletAddresses[selectedNetwork]}
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() =>
                      copyToClipboard(walletAddresses[selectedNetwork])
                    }
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex h-[200px] w-[200px] items-center justify-center bg-muted text-sm text-muted-foreground">
                  {
                    <img
                      src={`/qr-codes/${["bsc", "aone", "opmain", "basemain"].includes(
                        selectedNetwork,
                      )
                        ? "eth-main"
                        : selectedNetwork
                        }.png`}
                      alt="QR Code"
                      width={200}
                      height={200}
                    />
                  }
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Scan the QR code or copy the address above to make your
                  donation.
                </p>
                <p className="mt-2">Thank you for your support!</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
