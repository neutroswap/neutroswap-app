"use client";

import { XNEUTRO_ABI } from "@/shared/abi";
import { Key, useMemo, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";

import { Card, CardContent } from "@/components/elements/Card";
import { formatEther } from "viem";
import { NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT } from "@/shared/helpers/constants";
import { XNEUTRO_CONTRACT } from "@/shared/helpers/contract";
import { multicall } from "@wagmi/core";
import { Button } from "@geist-ui/core";
import { classNames } from "@/shared/helpers/classNamer";

export default function VestingXneutro() {
  const { address } = useAccount();

  const [redeemsLength, setRedeemsLength] = useState(0);
  const [pendingRedeems, setPendingRedeems] = useState<any>([]);
  const [claimableRedeems, setClaimableRedeems] = useState<any>([]);

  const { data: userRedeemsLength } = useContractRead({
    address: XNEUTRO_CONTRACT,
    abi: XNEUTRO_ABI,
    functionName: "getUserRedeemsLength",
    args: [address!],
    onSuccess: async (userRedeemsLength) => {
      const lengthNumber = Number(userRedeemsLength);
      setRedeemsLength(lengthNumber);
      let contracts = [];
      for (let i = 0; i < lengthNumber; i++) {
        let contract = {
          address: XNEUTRO_CONTRACT,
          abi: XNEUTRO_ABI,
          functionName: "getUserRedeem",
          args: [address!, BigInt(i)],
        };
        contracts.push(contract);
      }

      const userRedeemsInfo: any = await multicall({
        contracts,
        allowFailure: false,
      });

      let claimable = [];
      let pending = [];
      for (let i = 0; i < userRedeemsInfo.length; i++) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const timeDifference = Number(userRedeemsInfo[i][2]) - currentTimestamp;
        const days = Math.floor(timeDifference / 86400);
        const hours = Math.floor((timeDifference % 86400) / 3600);
        const minutes = Math.floor((timeDifference % 3600) / 60);
        let date = {
          days,
          hours,
          minutes,
        };
        userRedeemsInfo[i].date = date;
        if (userRedeemsInfo[i][2] <= currentTimestamp) {
          claimable.push({ index: i, ...userRedeemsInfo[i] });
        } else {
          pending.push({ index: i, ...userRedeemsInfo[i] });
        }
      }
      setClaimableRedeems(claimable);
      setPendingRedeems(pending);
      return userRedeemsInfo;
    },
  });

  return (
    <>
      {redeemsLength == 0 && (
        <Card className="flex flex-col gap-4 mt-5">
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold">Vesting</div>
            </div>
          </CardContent>
        </Card>
      )}

      {redeemsLength > 0 && (
        <Card className="flex flex-col gap-6 mt-5">
          <CardContent>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold ">Vesting</h2>
              <p className="text-sm font-normal leading-5 text-neutral-500">
                Redeeming xNEUTRO back into NEUTRO require a vesting period. All
                of that information will be shown here
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase leading-4 tracking-wide text-neutral-500">
                Pending
              </span>

              <>
                {pendingRedeems.map(
                  (item: any, index: Key | null | undefined) => (
                    <PendingRedeem key={index} data={item} />
                  )
                )}
              </>
            </div>
            <>
              {claimableRedeems.map(
                (item: any, index: Key | null | undefined) => (
                  <ClaimableRedeem key={index} data={item} />
                )
              )}
            </>
          </CardContent>
        </Card>
      )}
    </>
  );
}
const PendingRedeem = ({ data }: { data: any }) => {
  const { config: cancelRedeemConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x{string}`,
    abi: XNEUTRO_ABI,
    functionName: "cancelRedeem",
    args: [BigInt(data.index)],
  });

  const { write: cancelRedeem, isLoading: isLoadingCancelRedeem } =
    useContractWrite({
      ...cancelRedeemConfig,
    });

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold leading-6 sm:text-base">
          <span className="dark:text-white">
            {" "}
            {Number(formatEther(data[1])).toFixed(2)}{" "}
          </span>
          <span className="text-neutral-500 text-sm"> xNEUTRO </span>
          <span className="text-neutral-500"> &gt; </span>
          <span className="dark:text-white">
            {" "}
            {Number(formatEther(data[0])).toFixed(2)}{" "}
          </span>
          <span className="text-neutral-500 text-sm"> NEUTRO </span>
        </span>
        <span className="text-xs font-normal leading-4 text-neutral-500">
          Claimable in {data.date.days}d {data.date.hours}h {data.date.minutes}m
        </span>
      </div>
      <button
        disabled={!cancelRedeem}
        onClick={() => cancelRedeem?.()}
        className="rounded-md px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 hover:text-red-800"
      >
        Cancel
      </button>
    </div>
  );
};
const ClaimableRedeem = ({ data }: { data: any }) => {
  const { chain } = useNetwork();
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const { config: finalizeRedeemConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x{string}`,
    abi: XNEUTRO_ABI,
    functionName: "finalizeRedeem",
    args: [BigInt(data.index)],
  });

  const { write: finalizeRedeem, isLoading: isLoadingFinalizeRedeem } =
    useContractWrite({
      ...finalizeRedeemConfig,
    });

  let claimableText = "";

  if (data.date.days <= 0 && data.date.hours <= 0 && data.date.minutes <= 0) {
    claimableText = "Claimable";
  } else {
    claimableText = `Claimable in ${data.date.days}d ${data.date.hours}h ${data.date.minutes}m`;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold uppercase leading-4 tracking-wide text-neutral-500">
        Claimable
      </span>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold leading-6 sm:text-base">
            <span className="dark:text-white">
              {Number(formatEther(data[1])).toFixed(2)}
            </span>{" "}
            <span className="text-neutral-500 text-sm">xNEUTRO</span>{" "}
            <span className="text-neutral-500">&gt;</span>{" "}
            <span className="dark:text-white">
              {Number(formatEther(data[0])).toFixed(2)}
            </span>{" "}
            <span className="text-neutral-500 text-sm">NEUTRO</span>
          </span>
          <span className="text-xs font-normal leading-4 text-neutral-500">
            {claimableText}
          </span>
        </div>
        {claimableText === "Claimable" && (
          <Button
            disabled={!finalizeRedeem}
            onClick={() => finalizeRedeem?.()}
            className={classNames(
              "!flex !items-center !px-3.5 !py-2 !transition-all !rounded-lg !cursor-pointer !w-full !justify-center !font-semibold !shadow-dark-sm !text-sm",
              "text-white dark:text-amber-600",
              "!bg-amber-500 hover:bg-amber-600 dark:bg-opacity-[.08]",
              "!border !border-orange-600/50 dark:border-orange-400/[.12]"
            )}
          >
            Claim NEUTRO
          </Button>
        )}
      </div>
    </div>
  );
};
