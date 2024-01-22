import { Button } from "@geist-ui/core";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { DIVIDENDS_ABI, NEUTRO_HELPER_ABI, XNEUTRO_ABI } from "@/shared/abi";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";
import { waitForTransaction } from "@wagmi/core";
import { currencyFormat } from "@/shared/utils";
import {
  DIVIDENDS_CONTRACT,
  NEUTRO_HELPER_CONTRACT,
} from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { tokens } from "@/shared/statics/tokenList";
import { SupportedChainID } from "@/shared/types/chain.types";
import getPairInfo from "@/shared/getters/getPairInfo";
import TokenLogo from "@/components/modules/TokenLogo";

interface Reward extends Omit<Token, "logo"> {
  logo: string[];
}

export default function PendingDividends() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const { data } = useContractReads({
    enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "userPendingRewardsInDividendsPlugin",
        args: [address!],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "dividendsDistributedTokensRewards",
      } as const,
    ],
  });

  //Claim all button function
  const { config: harvestAllConfig, refetch: refetchHarvestAllConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address!),
      address: DIVIDENDS_CONTRACT,
      abi: DIVIDENDS_ABI,
      functionName: "harvestAllDividends",
    });
  const { write: harvestAll, isLoading: isLoadingHarvestAll } =
    useContractWrite({
      ...harvestAllConfig,
      onSuccess: async (tx) => {
        await waitForTransaction({ hash: tx.hash, confirmations: 8 });
      },
    });

  const addressToTokenInfo = useMemo(() => {
    if (!chain || chain.unsupported) return new Map<`0x${string}`, Token>();
    return new Map(
      tokens[chain.id as unknown as SupportedChainID].map((item) => [
        item.address,
        item,
      ])
    );
  }, [chain]);

  function getRewardInfo(address: `0x${string}`): Reward {
    const info = addressToTokenInfo.get(address);
    if (!info) {
      getPairInfo(address).then((pair) => {
        if (!pair[0] || !pair[1]) return;
        const lpInfo: Reward = {
          name: `NEUTRO LP Token`,
          address: address,
          symbol: `${pair[0].symbol}-${pair[1].symbol} LP`,
          logo: [pair[0].logo, pair[1].logo],
          decimal: 18,
        };
        return lpInfo;
      });
      return {
        name: `Unknown LP Token`,
        address: address,
        symbol: `Unknown LP`,
        logo: [],
        decimal: 18,
      };
    }
    return {
      ...info,
      logo: [info.logo],
    };
  }

  return (
    <div className="-space-y-12">
      <div className="flex flex-row items-center justify-between w-full md:p-8 md:pt-0">
        <p className="m-0 text-left font-semibold whitespace-nowrap">
          Your dividends
        </p>
        <div className="flex space-x-4">
          <Button
            className="px-4 py-2 text-white border bg-amber-500 border-orange-600/50 text-xs font-semibold hover:bg-amber-600 rounded"
            onClick={() => harvestAll?.()}
            loading={isLoadingHarvestAll}
            disabled={!harvestAll}
          >
            Claim all
          </Button>
        </div>
      </div>

      {!!data &&
        data[0].map((reward, index) => {
          const info = getRewardInfo(reward.token);
          if (!info) return;
          return (
            <AllocationReward key={index} props={reward} info={reward.token} />
          );
        })}
    </div>
  );
}

type Props = {
  token: `0x${string}`;
  amount: bigint;
  amountInUsd: bigint;
};

const AllocationReward = ({ props, info }: { props: Props; info: any }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { refetch: infoRewards } = useContractReads({
    enabled: Boolean(address),
    cacheOnBlock: true,
    allowFailure: false,
    contracts: [
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "userPendingRewardsInDividendsPlugin",
        args: [address!],
      } as const,
      {
        address: NEUTRO_HELPER_CONTRACT,
        abi: NEUTRO_HELPER_ABI,
        functionName: "dividendsDistributedTokensRewards",
      } as const,
    ],
  });

  //Claim individual reward button function
  const { config: harvestConfig, refetch: refetchHarvestConfig } =
    usePrepareContractWrite({
      enabled: Boolean(address!),
      address: DIVIDENDS_CONTRACT,
      abi: DIVIDENDS_ABI,
      functionName: "harvestDividends",
      args: [props.token],
    });
  const { write: harvest, isLoading: isLoadingHarvest } = useContractWrite({
    ...harvestConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
    },
  });

  const addressToTokenInfo = useMemo(() => {
    if (!chain || chain.unsupported) return new Map<`0x${string}`, Token>();
    return new Map(
      tokens[chain.id as unknown as SupportedChainID].map((item) => [
        item.address,
        item,
      ])
    );
  }, [chain]);

  function getRewardInfo(address: `0x${string}`): Reward {
    const info = addressToTokenInfo.get(address);
    if (!info) {
      getPairInfo(address).then((pair) => {
        if (!pair[0] || !pair[1]) return;
        const lpInfo: Reward = {
          name: `NEUTRO LP Token`,
          address: address,
          symbol: `${pair[0].symbol}-${pair[1].symbol} LP`,
          logo: [pair[0].logo, pair[1].logo],
          decimal: 18,
        };
        return lpInfo;
      });
      return {
        name: `Unknown LP Token`,
        address: address,
        symbol: `Unknown LP`,
        logo: [],
        decimal: 18,
      };
    }
    return {
      ...info,
      logo: [info.logo],
    };
  }

  const reward = getRewardInfo(info);

  const formattedAmount = useMemo(() => {
    const amountInUnits = formatEther(BigInt(props.amount));
    return `${Number(amountInUnits).toFixed(5)} `;
  }, [props.amount, reward.decimal]);

  return (
    <div className="flex flex-row items-center justify-between w-full md:p-8 md:mt-0">
      <div className="flex items-center">
        <div className="flex">
          {reward.logo.map((logo) => (
            <TokenLogo className="w-8 h-8" src={logo} key={logo} />
          ))}
        </div>
        <div className="ml-2">
          <span className="text-sm text-neutral-500">{reward.symbol}</span>
          <br />
          <span className="text-sm">
            {formattedAmount} &nbsp;
            <span className="text-neutral-500 text-xs">
              ($
              {currencyFormat(
                parseFloat(formatEther(BigInt(props.amountInUsd))),
                2,
                0.01
              )}
              )
            </span>
          </span>
        </div>
      </div>
      <div>
        <Button
          onClick={() => harvest?.()}
          loading={isLoadingHarvest}
          disabled={!harvest}
          className="px-5 py-2 border bg-grey-500 text-xs font-semibold rounded"
        >
          Claim
        </Button>
      </div>
    </div>
  );
};
