import { Button, useTheme } from "@geist-ui/core";
import { ScaleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import { Token } from "@/shared/types/tokens.types";
import { classNames } from "@/shared/helpers/classNamer";
import { BigNumber } from "ethers";
import { Currency } from "@/shared/types/currency.types";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { formatEther, getAddress } from "viem";

import { tokens } from "@/shared/statics/tokenList";
import { useNetwork } from "wagmi";
import {
  DEFAULT_CHAIN_ID,
  supportedChainID,
  SupportedChainID,
} from "@/shared/types/chain.types";
import { ResponsiveDialog } from "@/components/modules/ResponsiveDialog";
import { WrapPositionModal } from "@/components/modules/Modal/WrapPosition";

type PoolOverviewPanelProps = {
  token0: Token;
  token1: Token;
  priceRatio: [number, number];
  totalLPSupply: bigint;
  userLPBalance: Currency;
  poolBalances: Currency[];
};

type Urls = {
  contract_address: string;
};

const getExplorerLink: Record<SupportedChainID, Urls> = {
  "17777": {
    contract_address:
      "https://explorer.evm.eosnetwork.com/address/${contractAddress}",
  },
  "15557": {
    contract_address:
      "https://explorer.testnet.evm.eosnetwork.com/address/${contractAddress}",
  },
};

const PoolOverviewPanel: React.FC<PoolOverviewPanelProps> = (props) => {
  const {
    priceRatio,
    token0,
    token1,
    totalLPSupply,
    userLPBalance,
    poolBalances,
  } = props;

  const router = useRouter();
  const theme = useTheme();
  const { chain } = useNetwork();

  const contractAddress = router.query.id;
  const isValidContractAddress = typeof contractAddress === "string";
  const baseLink =
    getExplorerLink[(chain?.id || DEFAULT_CHAIN_ID) as SupportedChainID];
  const link = isValidContractAddress
    ? `${baseLink.contract_address.replace(
        "${contractAddress}",
        contractAddress
      )}`
    : "#";

  const [isPriceFlipped, setIsPriceFlipped] = useState(false);

  // TODO: MOVE THIS HOOKS
  const nativeToken = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID][0];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID][0];
    return tokens[chain.id.toString() as SupportedChainID][0];
  }, [chain]);

  return (
    <div className="">
      <div className="flex items-center space-x-3">
        <ScaleIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
        <p className="m-0 text-2xl font-semibold">Pool Overview</p>
      </div>
      <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">
        Contract:{" "}
        <a href={link} target="_blank" rel="noopener noreferrer">
          {router.query.id}
        </a>
      </p>

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
            <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
              =
            </span>
            <span className="text-sm font-semibold">
              {priceRatio[1].toFixed(5)} {token1.symbol}
            </span>
          </>
        )}
        {isPriceFlipped && (
          <>
            <span className="text-sm font-semibold">1 {token1.symbol}</span>
            <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
              =
            </span>
            <span className="text-sm font-semibold">
              {priceRatio[0].toFixed(5)} {token0.symbol}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg px-4 py-6 box-border">
          <p className="m-0 mb-2 text-xs font-bold uppercase text-neutral-500">
            Owned LP
          </p>
          <div className="flex items-center justify-between">
            <p className="m-0 text-2xl font-semibold">
              {(+formatEther(userLPBalance.raw)).toFixed(8)} NLP
            </p>
            <ResponsiveDialog.Root shouldScaleBackground>
              <ResponsiveDialog.Trigger>
                <Button>Convert to spNFT</Button>
              </ResponsiveDialog.Trigger>
              <ResponsiveDialog.Content>
                <WrapPositionModal
                  pool={router.query.id as `0x${string}`}
                  // stats={stats}
                />
              </ResponsiveDialog.Content>
            </ResponsiveDialog.Root>
          </div>
        </div>
        <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg px-4 py-6 box-border">
          <p className="m-0 mb-2 text-xs font-bold uppercase text-neutral-500">
            Pool Shares
          </p>
          <p className="m-0 text-2xl font-semibold">
            {(
              +formatEther(userLPBalance.raw) / +formatEther(totalLPSupply)
            ).toFixed(6)}
            %
          </p>
        </div>
      </div>

      <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3">
          <div>
            <p className="m-0 text-neutral-500 text-sm">Assets in Pool</p>
            <div className="space-y-3 mt-4">
              <div className="flex space-x-4 items-center">
                <div className="flex items-center px-2 py-1 bg-orange-300/20 rounded-lg">
                  <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                    50%
                  </span>
                </div>
                <div className="flex space-x-2 items-center">
                  <img
                    alt={`${token0.symbol} Icon`}
                    src={token0.logo}
                    className="h-5 rounded-full"
                    onError={(e) => {
                      handleImageFallback(token0.symbol, e);
                    }}
                  />
                  <p className="m-0 font-medium text-sm">
                    {poolBalances[0].formatted} {token0.symbol}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 items-center">
                <div className="flex items-center px-2 py-1 bg-orange-300/20 rounded-lg">
                  <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                    50%
                  </span>
                </div>
                <div className="flex space-x-2 items-center">
                  <img
                    alt={`${token1.symbol} Icon`}
                    src={
                      token1.address === nativeToken.address
                        ? nativeToken.logo
                        : token1.logo
                    }
                    className="h-5 rounded-full"
                    onError={(e) => {
                      handleImageFallback(token1.symbol, e);
                    }}
                  />
                  <p className="m-0 font-medium text-sm">
                    {poolBalances[1].formatted} {token1.symbol}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="w-full mt-4 border border-neutral-200/50 dark:border-neutral-800 rounded-lg"> */}
      {/*   <div className="w-full flex flex-col items-center py-6"> */}
      {/*     {theme.type === "nlight" && <NoContentLight className="w-40 h-40" />} */}
      {/*     {theme.type === "ndark" && <NoContentDark className="w-40 h-40" />} */}
      {/*     <p className="text-neutral-500 text-center">You do not have any liquidity positions. Deposit some tokens to open a position.</p> */}
      {/*     <Button className="!mt-2">Deposit now</Button> */}
      {/*   </div> */}
      {/* </div> */}
    </div>
  );
};

export default PoolOverviewPanel;
