"use client";

import { XGRAIL_ABI } from "@/shared/abi";
import { Key, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { multicall } from "@wagmi/core";
import { Card, CardContent } from "@/components/elements/Card";
import { formatEther } from "ethers/lib/utils.js";
import { NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT } from "@/shared/helpers/constants";

export default function VestingXgrail() {
  const { address } = useAccount();

  const [redeemsLength, setRedeemsLength] = useState(0);
  const [pendingRedeems, setPendingRedeems] = useState<any>([]);
  const [claimableRedeems, setClaimableRedeems] = useState<any>([]);

  const { data: userRedeemsLength } = useContractRead({
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
    abi: XGRAIL_ABI,
    functionName: "getUserRedeemsLength",
    args: [address!],
    onSuccess: async (userRedeemsLength) => {
      const lengthNumber = Number(userRedeemsLength);
      setRedeemsLength(lengthNumber);
      let contracts = [];
      for (let i = 0; i < lengthNumber; i++) {
        let contract = {
          address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x${string}`,
          abi: XGRAIL_ABI,
          functionName: "getUserRedeem",
          args: [address!, BigInt(i)],
        };
        contracts.push(contract);
      }

      const userRedeemsInfo: any = await multicall({
        ...contracts,
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
              <h2 className="text-lg font-semibold text-gray-900">Vesting</h2>
            </div>
          </CardContent>
        </Card>
      )}

      {redeemsLength > 0 && (
        <Card className="flex flex-col gap-6">
          <CardContent>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">Vesting</h2>
              <p className="text-sm font-normal leading-5 text-gray-500">
                Redeeming xGRAIL back into GRAIL require a vesting period. All
                of that information will be shown here
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase leading-4 tracking-wide text-gray-700">
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
  const { chain } = useNetwork();
  //   const { XGFC } = useConfig(chain);

  const { config: cancelRedeemConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x{string}`,
    abi: XGRAIL_ABI,
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
          <span className="text-gray-900">
            {" "}
            {Number(formatEther(data[1])).toFixed(2)}{" "}
          </span>
          <span className="text-gray-600"> xGRAIL </span>
          <span className="text-gray-600"> &gt; </span>
          <span className="text-gray-900">
            {" "}
            {Number(formatEther(data[0])).toFixed(2)}{" "}
          </span>
          <span className="text-gray-600"> GRAIL </span>
        </span>
        <span className="text-xs font-normal leading-4 text-gray-500">
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
  //   const { XGFC } = useConfig(chain);

  const { config: finalizeRedeemConfig } = usePrepareContractWrite({
    address: NEXT_PUBLIC_XGRAIL_TOKEN_CONTRACT as `0x{string}`,
    abi: XGRAIL_ABI,
    functionName: "finalizeRedeem",
    args: [BigInt(data.index)],
  });

  const { write: finalizeRedeem, isLoading: isLoadingFinalizeRedeem } =
    useContractWrite({
      ...finalizeRedeemConfig,
    });

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-semibold uppercase leading-4 tracking-wide text-gray-700">
        Claimable
      </span>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold leading-6 sm:text-base">
            <span className="text-gray-900">
              {" "}
              {Number(formatEther(data[1])).toFixed(2)}{" "}
            </span>
            <span className="text-gray-600"> xGRAIL </span>
            <span className="text-gray-600"> &gt; </span>
            <span className="text-gray-900">
              {" "}
              {Number(formatEther(data[0])).toFixed(2)}{" "}
            </span>
            <span className="text-gray-600"> GRAIL </span>
          </span>
          <span className="text-xs font-normal leading-4 text-gray-500">
            Claimable in {data.date.days}d {data.date.hours}h{" "}
            {data.date.minutes}m{" "}
          </span>
        </div>
        <button
          disabled={!finalizeRedeem}
          onClick={() => finalizeRedeem?.()}
          className="rounded-md px-3.5 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 hover:text-sky-700"
        >
          Claim GRAIL
        </button>
      </div>
    </div>
  );
};
