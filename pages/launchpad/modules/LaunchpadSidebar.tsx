"use client";

import { cn, currencyFormat } from "@/shared/utils";
import { LaunchPhase } from "./LaunchpadSteps";
import { Content } from "@/.contentlayer/generated";
import TokenLogo from "@/components/elements/TokenLogo";
import { format, parseISO } from "date-fns";
import PhaseTags from "./PhaseTags";
import { GetFairAuctionQuery } from "@/shared/gql/types/launchpad/graphql";
import { Input } from "@/components/elements/ui/input";
import { Button } from "@/components/elements/ui/button";
import { useLaunchpadPhase } from "@/shared/hooks/useLaunchpadPhase";
import ReferralCard from "./ReferralCard";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useReadLocalStorage } from "usehooks-ts";
import { LAUNCHPAD_POOL_ABI } from "@/shared/abi/launchpad-pool.abi";
import { useForm, useWatch } from "react-hook-form";
import useDebounceValue from "@/shared/hooks/useDebounceValue";
import { Form, FormControl, FormField, FormItem } from "@/components/elements/ui/form";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import { useApprove } from "@/shared/hooks/useApprove";
import { useBalanceAndAllowance } from "@/shared/hooks/useBalanceAndAllowance";
import { useMemo } from "react";
import { waitForTransaction } from "@wagmi/core";

type SidebarProps = {
  data: Content;
  auction: GetFairAuctionQuery["fairAuction"];
};

type Props = {
  phase: LaunchPhase;
  data: Content;
  auction: GetFairAuctionQuery["fairAuction"];
};

function SidebarContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative border rounded-lg bg-white dark:bg-slate-900/50 shadow shadow-slate-200 dark:shadow-black overflow-hidden",
        "py-4 px-6"
      )}
    >
      {children}
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { address } = useAccount();
  const phase = useLaunchpadPhase(props.data);
  const contentProps = { ...props, phase };

  return (
    <div className="space-y-4">
      <SidebarContainer>
        <div className="absolute top-4 right-4">
          <PhaseTags data={props.data} />
        </div>
        <SidebarContent {...contentProps} />
      </SidebarContainer>
      {!!address && (
        <ReferralCard
          launchpadPoolContract={props.data.contract as `0x${string}`}
          saleTokenDecimals={props.auction?.saleTokenDecimals}
        />
      )}
    </div>
  );
}

export function SidebarContent(props: Props) {
  const { phase } = props;
  switch (phase) {
    case "upcoming":
      return <LaunchUpcoming {...props} />;
    case "whitelist":
      return <LaunchWhitelist {...props} />;
    case "public":
      return <LaunchPublic {...props} />;
    case "claim":
      return <LaunchClaim {...props} />;
    default:
      return <></>;
  }
}

function LaunchUpcoming(props: Props) {
  const { phase, data } = props;
  return (
    <div>
      <span className="text-xs uppercase text-muted-foreground font-semibold">
        {data.symbol} is Raising
      </span>
      <div className="flex items-center mt-1">
        <p className="text-5xl font-semibold">
          {currencyFormat(data.raise.value, 0, 0)}
        </p>
        <TokenLogo
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
          className="w-8 h-8 ml-2"
        />
      </div>
      <div className="text-sm mt-5 space-y-1 text-muted-foreground">
        {data.raise.supply && (
          <div className="flex justify-between">
            <span>Max. supply</span>
            <div className="flex items-center">
              <p>{currencyFormat(data.raise.supply, 0, 0)}</p>
              <TokenLogo src={data.logo} className="w-5 h-5 ml-2" />
            </div>
          </div>
        )}
        {data.raise.max && (
          <div className="flex justify-between">
            <span>Max. Cap</span>
            <div className="flex items-center">
              <p>{currencyFormat(data.raise.max, 0, 0)}</p>
              <TokenLogo
                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
                className="w-5 h-5 ml-2"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center p-2 mt-4 rounded-lg w-full bg-secondary text-secondary-foreground">
        <span>Coming in</span>
        <time dateTime={data.date} className="ml-2">
          {format(parseISO(data.date), "LLLL d, yyyy")}
        </time>
      </div>
    </div>
  );
}

function LaunchWhitelist(props: Props) {
  const { phase, data, auction } = props;
  return (
    <div>
      <span className="text-xs uppercase text-muted-foreground font-semibold">
        {data.symbol} is Raising
      </span>
      <div className="flex items-center mt-1">
        <p className="text-5xl font-semibold">
          {currencyFormat(data.raise.value, 0, 0)}
        </p>
        <TokenLogo
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
          className="w-8 h-8 ml-2"
        />
      </div>
      <div className="text-sm mt-5 space-y-1 text-muted-foreground">
        <div className="flex justify-between">
          <span>Raise target</span>
          <div className="flex items-center">
            <p>{currencyFormat(auction?.minToRaise, 0, 0)}</p>
            <TokenLogo
              src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
              className="w-5 h-5 ml-2"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <span>Final Price</span>
          <div className="flex items-center">
            <p>{currencyFormat(auction?.finalPrice, 0, 0)}</p>
            <TokenLogo
              src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
              className="w-5 h-5 ml-2"
            />
          </div>
        </div>
      </div>
      <Input type="number" className="mt-4" placeholder="0.00" />
      <Button className="w-full mt-4">Buy 1 {data.symbol}</Button>
    </div>
  );
}
function LaunchPublic(props: Props) {
  const { phase, data, auction } = props;
  const { address } = useAccount();

  // NOTE: USE THIS REFERRER to populate referrrer args on contractWrite
  const referrer = useReadLocalStorage<`0x${string}`>("esper.referrer");

  // use form utils
  const form = useForm({
    defaultValues: {
      contribute: "",
    },
  });
  const contributeAmount = useWatch({
    control: form.control,
    name: "contribute",
  });
  const debouncedContributeAmount = useDebounceValue(contributeAmount, 500);

  //Check balance & allowance
  const {
    balance: balance,
    allowance: allowance,
    refetch: refetchBalanceAndAllowance,
  } = useBalanceAndAllowance(
    props.auction?.saleToken,
    props.data.contract as `0x${string}`
  );

  //Check available balance
  const availableToken = useMemo(() => {
    if (!balance) return "0";
    return `${Number(
      formatUnits(balance, props.auction?.saleTokenDecimals)
    ).toFixed(2)}`;
  }, [balance, props.auction?.saleTokenDecimals]);

  //Approve function
  const { write: approve, isLoading: isApproving } = useApprove({
    address: props.auction?.saleToken as `0x${string}`,
    spender: props.data.contract as `0x${string}`,
  });

  // Check if isApproved
  const isApproved = useMemo(() => {
    return (
      allowance >=
      parseUnits(debouncedContributeAmount, props.auction?.saleTokenDecimals)
    );
  }, [allowance, debouncedContributeAmount, props.auction?.saleTokenDecimals]);

  //Contribute write function
  const { config: contributeConfig } = usePrepareContractWrite({
    enabled: Boolean(address),
    address: props.data.contract as `0x${string}`,
    abi: LAUNCHPAD_POOL_ABI,
    functionName: "buy",
    args: [
      parseUnits(debouncedContributeAmount, props.auction?.saleTokenDecimals),
      referrer === null
        ? "0x0000000000000000000000000000000000000000"
        : (referrer as `0x${string}`),
    ],
  });
  const { write: contribute, isLoading: isContributing } = useContractWrite({
    ...contributeConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
    },
  });

  // Checking balance sufficiency
  const isAmountInvalid = () => {
    let value: number;
    value = Number(formatUnits(balance, props.auction?.saleTokenDecimals));
    return Number(debouncedContributeAmount) > value;
  };

  return (
    <Form {...form}>
      <div>
        <span className="text-xs uppercase text-muted-foreground font-semibold">
          {data.symbol} is Raising
        </span>
        <div className="flex items-center mt-1">
          <p className="text-5xl font-semibold">
            {currencyFormat(data.raise.value, 0, 0)}
          </p>
          <TokenLogo
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
            className="w-8 h-8 ml-2"
          />
        </div>
        <div className="text-sm mt-5 space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Raise target</span>
            <div className="flex items-center">
              <p>{currencyFormat(auction?.minToRaise, 0, 0)}</p>
              <TokenLogo
                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
                className="w-5 h-5 ml-2"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span>Final Price</span>
            <div className="flex items-center">
              <p>{currencyFormat(auction?.finalPrice, 0, 0)}</p>
              <TokenLogo
                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
                className="w-5 h-5 ml-2"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="m-0 text-sm text-muted-foreground">Balance</p>
          <div className="flex">
            <p className="text-sm text-muted-foreground">{availableToken}</p>
            <TokenLogo
              src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${data.raise.symbol.toLowerCase()}.svg`}
              className="w-5 h-5 ml-2"
            />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-1">
          <FormField
            control={form.control}
            name="contribute"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            className="text-sm"
            onClick={() => form.setValue("contribute", availableToken)}
          >
            MAX
          </Button>
        </div>
        {isAmountInvalid() && (
          <small className="mt-1 text-red-500">Insufficient balance</small>
        )}
        {(() => {
          if (!isApproved) {
            return (
              <Button
                type="button"
                variant="outline"
                disabled={!approve}
                loading={isApproving}
                onClick={() => approve?.()}
                className="w-full mt-4"
              >
                Approve
              </Button>
            );
          }
          return (
            <Button
              type="button"
              variant="outline"
              disabled={!contribute}
              loading={isContributing}
              onClick={() => contribute?.()}
              className="w-full mt-4"
            >
              Buy {data.symbol}
            </Button>
          );
        })()}
      </div>
    </Form>
  );
}

function LaunchClaim(props: Props) {
  const { data, auction } = props;
  const { address } = useAccount();

  const { config: claimConfig } = usePrepareContractWrite({
    enabled: Boolean(address),
    address: props.data.contract as `0x${string}`,
    abi: LAUNCHPAD_POOL_ABI,
    functionName: "claim",
  });
  const { write: claim, isLoading: isClaiming } = useContractWrite({
    ...claimConfig,
    onSuccess: async (tx) => {
      await waitForTransaction({ hash: tx.hash, confirmations: 8 });
    },
  });

  return (
    <div>
      <span className="text-xs uppercase text-muted-foreground font-semibold">
        Claimable {data.symbol}
      </span>
      <div className="flex items-center mt-1 mb-4">
        <p className="text-5xl font-semibold">{currencyFormat(1000, 0, 0)}</p>
        <TokenLogo src={data.logo} className="w-8 h-8 ml-2" />
      </div>
      <Button
        className={cn("w-full uppercase font-semibold tracking-tight")}
        disabled={!claim}
        loading={isClaiming}
        onClick={() => claim?.()}
      >
        Claim {data.symbol}
      </Button>
    </div>
  );
}
