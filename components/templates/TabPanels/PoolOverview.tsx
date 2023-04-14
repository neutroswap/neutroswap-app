import { Button, useTheme } from "@geist-ui/core";
import { ScaleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import NoContentDark from "@/public/states/empty/dark.svg"
import NoContentLight from "@/public/states/empty/light.svg"
import { Token } from "@/shared/types/tokens.types";
import { classNames } from "@/shared/helpers/classNamer";

type PoolOverviewPanelProps = {
  token0: Token;
  token1: Token;
  priceRatio: [number, number]
};

const PoolOverviewPanel: React.FC<PoolOverviewPanelProps> = (props) => {
  const { priceRatio, token0, token1 } = props;

  const router = useRouter();
  const theme = useTheme();

  const [isPriceFlipped, setIsPriceFlipped] = useState(false);

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Pool Overview</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p>

      <div
        onClick={() => setIsPriceFlipped((prev) => !prev)}
        className={classNames(
          "inline-flex space-x-2 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-900 rounded-lg transition",
          "hover:scale-[102%] cursor-pointer active:scale-[95%]"
        )}
      >
        {!isPriceFlipped && (
          <>
            <span className="text-sm font-semibold">1 {token0.symbol}</span>
            <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">=</span>
            <span className="text-sm font-semibold">{priceRatio[1].toFixed(5)} {token1.symbol}</span>
          </>
        )}
        {isPriceFlipped && (
          <>
            <span className="text-sm font-semibold">1 {token1.symbol}</span>
            <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">=</span>
            <span className="text-sm font-semibold">{priceRatio[0].toFixed(5)} {token0.symbol}</span>
          </>
        )}
      </div>

      <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg">
        <div className="w-full flex flex-col items-center py-6">
          {theme.type === "nlight" && <NoContentLight className="w-40 h-40" />}
          {theme.type === "ndark" && <NoContentDark className="w-40 h-40" />}
          <p className="text-neutral-500 text-center">You do not have any liquidity positions. Deposit some tokens to open a position.</p>
          <Button className="!mt-2">Deposit now</Button>
        </div>
      </div>
    </div>
  )
}

export default PoolOverviewPanel;
