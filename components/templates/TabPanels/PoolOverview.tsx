import { Button, useTheme } from "@geist-ui/core";
import { ScaleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"

const PoolOverviewPanel = () => {
  const router = useRouter();
  const theme = useTheme();
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;
    (async () => {
      const req = await fetch(`/api/getUserLP?userAddress=${address}`)
      const response = await req.json()
      console.log('userLP', response);
    })()
  }, [address])

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Pool Overview</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p>

      <div className="inline-flex space-x-2 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-900 rounded-lg">
        <span className="text-sm font-semibold">1 USDT</span>
        <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">=</span>
        <span className="text-sm font-semibold">1 DONI</span>
      </div>

      <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg">
        <div className="w-full flex flex-col items-center py-6">
          {theme.type === "light" && <NoContentLight className="w-40 h-40" />}
          {theme.type === "dark" && <NoContentDark className="w-40 h-40" />}
          <p className="text-neutral-500 text-center">You do not have any liquidity positions. Deposit some tokens to open a position.</p>
          <Button className="!mt-2">Deposit now</Button>
        </div>
      </div>
    </div>
  )
}

export default PoolOverviewPanel;
