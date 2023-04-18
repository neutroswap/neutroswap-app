import { ERC20_ABI, NEUTRO_POOL_ABI, NEUTRO_ROUTER_ABI } from "@/shared/abi";
import { ROUTER_CONTRACT } from "@/shared/helpers/contract";
import { Token } from "@/shared/types/tokens.types";
import { BigNumber } from "ethers";
import { formatEther, getAddress, parseEther } from "ethers/lib/utils.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useContractReads, useContractWrite, usePrepareContractWrite } from "wagmi";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { Button, Input } from "@geist-ui/core";
import { Slider } from "@/components/elements/Slider";
import { Currency } from "@/shared/types/currency.types";
import dayjs from "dayjs";
import { tokens } from "@/shared/statics/tokenList";
import NativeTokenPicker from "@/components/modules/swap/NativeTokenPicker";

type PoolWithdrawalPanelProps = {
  balances: Currency[],
  token0: Token,
  token1: Token,
  totalLPSupply: BigNumber,
  userLPBalance: Currency,
  poolBalances: Currency[],
  refetchAllBalance: (options?: any) => Promise<any>;
  refetchUserBalances: (options?: any) => Promise<any>;
}

// TODO: move slippage to state or store
const SLIPPAGE = 50;
const NATIVE_TOKEN_ADDRESS = getAddress(tokens[0].address);

const PoolWithdrawalPanel: React.FC<PoolWithdrawalPanelProps> = (props) => {
  const { token0, token1, totalLPSupply, userLPBalance, poolBalances, refetchAllBalance, refetchUserBalances } = props;

  const router = useRouter();
  const { address } = useAccount();

  const [isPreferNative, setIsPreferNative] = useState(true);
  const [isLPTokenApproved, setIsLPTokenApproved] = useState(false);

  const [token0Amount, setToken0Amount] = useState<string>();
  const [token1Amount, setToken1Amount] = useState<string>();
  const [percentage, setPercentage] = useState(33);
  const [amount, setAmount] = useState<BigNumber>(BigNumber.from(0));

  const { refetch: refetchAllowance } = useContractRead({
    enabled: Boolean(address && router.query.id),
    address: router.query.id as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, ROUTER_CONTRACT],
    onSuccess(value) {
      setIsLPTokenApproved(+formatEther(value) > 0);
    },
  })

  const { config: approveLPTokenConfig } = usePrepareContractWrite({
    enabled: Boolean(router.query.id),
    address: router.query.id as `0x${string}`,
    abi: NEUTRO_POOL_ABI,
    functionName: 'approve',
    args: [
      ROUTER_CONTRACT,
      BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    ]
  })
  const { isLoading: isApprovingLPToken, write: approveLPToken } = useContractWrite({
    ...approveLPTokenConfig,
    onSuccess(result) {
      result.wait().then(() => refetchAllowance())
    }
  })

  const { config: removeLiquidityConfig, isFetching: isSimulatingRemoveLiquidity } = usePrepareContractWrite({
    enabled: Boolean(token0 && token1 && amount && !!token0Amount && !!token1Amount && address),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: 'removeLiquidity',
    args: [
      token0.address, // tokenA
      token1.address, // tokenB
      amount, // liquidity
      !!token0Amount ? parseEther(token0Amount!) : parseEther("0"), // amountAMin
      !!token1Amount ? parseEther(token1Amount!) : parseEther("0"), // amountBMin
      address!, // address
      BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
    ],
  })
  const {
    isLoading: isRemovingLiquidity,
    write: removeLiquidity
  } = useContractWrite({
    ...removeLiquidityConfig,
    onSuccess: async (tx) => {
      await tx.wait()
      await refetchAllBalance();
      await refetchUserBalances();
    }
  })

  const { config: removeLiquidityETHConfig, isFetching: isSimulatingRemoveLiquidityETH } = usePrepareContractWrite({
    enabled: Boolean(token0 && token1 && amount && !!token0Amount && !!token1Amount && address),
    address: ROUTER_CONTRACT,
    abi: NEUTRO_ROUTER_ABI,
    functionName: 'removeLiquidityETH',
    args: [
      token0.address === NATIVE_TOKEN_ADDRESS ? token1.address : token0.address, // token
      amount, // liquidity
      token0.address === NATIVE_TOKEN_ADDRESS ? parseEther(token1Amount ?? "0") : parseEther(token0Amount ?? "0"), // amountTokenMin
      token0.address === NATIVE_TOKEN_ADDRESS ? parseEther(token0Amount ?? "0") : parseEther(token1Amount ?? "0"), // amountETHMin
      address!, // address
      BigNumber.from(dayjs().add(5, 'minutes').unix()) // deadline
    ],
  })
  const {
    isLoading: isRemovingLiquidityETH,
    write: removeLiquidityETH
  } = useContractWrite({
    ...removeLiquidityETHConfig,
    onSuccess: async (tx) => {
      await tx.wait()
      await refetchAllBalance();
      await refetchUserBalances();
    }
  })

  useEffect(() => {
    if (amount.isZero() || totalLPSupply.isZero()) return;
    const token0 = amount.mul(poolBalances[0].raw).mul(10000 - SLIPPAGE).div(10000).div(totalLPSupply);
    const token1 = amount.mul(poolBalances[1].raw).mul(10000 - SLIPPAGE).div(10000).div(totalLPSupply);
    setToken0Amount(formatEther(token0));
    setToken1Amount(formatEther(token1));
  }, [amount, poolBalances, totalLPSupply])

  // NOTE: Enable for debugging only
  // useEffect(() => {
  //   console.log([
  //     token0.address, // tokenA
  //     token1.address, // tokenB
  //     amount.toString(), // liquidity
  //     !!token0Amount && parseEther(token0Amount!).toString(), // amountAMin
  //     !!token1Amount && parseEther(token1Amount!).toString(), // amountBMin
  //     address!, // address
  //     BigNumber.from(dayjs().add(5, 'minutes').unix()).toString() // deadline
  //   ])
  // }, [amount, token0, token1, token0Amount, token1Amount, token0Min, token1Min, address, deadline])

  return (
    <div className="">
      <div>
        <div className="flex items-center space-x-3">
          <ArrowUpTrayIcon className="w-5 h-5 rounded-lg border border-neutral-300 dark:border-neutral-700 p-1.5" />
          <p className="m-0 text-2xl font-semibold">Withdraw</p>
        </div>
        <p className="mt-2 mb-0 text-sm text-neutral-400 dark:text-neutral-600">
          Deposit tokens to the pool to start earning trading fees
        </p>
      </div>
      {/* <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-600">Contract: {router.query.id}</p> */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        <div className="w-full mt-4 col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">Amount to withdraw</p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between mb-2">
              <span className="m-0 text-2xl font-semibold bg-transparent w-full">
                {formatEther(amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">$0</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Available {userLPBalance.formatted}</span>
            </div>
            <Slider
              step={10}
              max={100}
              defaultValue={[percentage]}
              value={[percentage]}
              onValueChange={(value) => {
                setPercentage(value[0])
              }}
              onValueCommit={(value) => {
                setAmount(userLPBalance.raw.mul(value[0]).div(100));
              }}
            />
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(25)
                  setAmount(userLPBalance.raw.mul(25).div(100));
                }}
              >
                25%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(50)
                  setAmount(userLPBalance.raw.mul(50).div(100));
                }}
              >
                50%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(75)
                  setAmount(userLPBalance.raw.mul(75).div(100));
                }}
              >
                75%
              </Button>
              <Button
                auto
                scale={0.5}
                className="bg-transparent"
                onClick={() => {
                  setPercentage(100)
                  setAmount(userLPBalance.raw);
                }}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full col-span-7">
          <p className="mt-0 mb-2 font-medium text-neutral-500 dark:text-neutral-400">Expected to receive</p>
          <div className="flex flex-col py-5 px-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 items-center">
                {token0.address !== NATIVE_TOKEN_ADDRESS && (
                  <>
                    <img
                      alt={`${token0.symbol} Icon`}
                      src={token0.logo}
                      className="h-6 rounded-full"
                      onError={(e) => {
                        handleImageFallback(token0.symbol, e);
                      }}
                    />
                    <p className="m-0 font-bold">{token0.symbol}</p>
                  </>
                )}
                {token0.address === NATIVE_TOKEN_ADDRESS && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token0Amount}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2 items-center">
                {token1.address !== NATIVE_TOKEN_ADDRESS && (
                  <>
                    <img
                      alt={`${token1.symbol} Icon`}
                      src={token1.logo}
                      className="h-6 rounded-full"
                      onError={(e) => {
                        handleImageFallback(token1.symbol, e);
                      }}
                    />
                    <p className="m-0 font-bold">{token1.symbol}</p>
                  </>
                )}
                {token1.address === NATIVE_TOKEN_ADDRESS && (
                  <NativeTokenPicker handlePreferNative={setIsPreferNative} />
                )}
              </div>
              <div className="flex space-x-2 items-center">
                <Input
                  scale={1.5}
                  className="w-full rounded-lg"
                  placeholder="0.00"
                  value={token1Amount}
                />
              </div>
            </div>

            <div className="flex flex-col w-full mt-4">
              {!isLPTokenApproved && (
                <Button
                  scale={1.25}
                  className="!mt-2"
                  loading={isApprovingLPToken}
                  onClick={() => approveLPToken?.()}
                >
                  Approve LP token
                </Button>
              )}
              {isLPTokenApproved && (
                <>
                  {!isPreferNative && (
                    <Button
                      name="removeLiquidity"
                      scale={1.25}
                      className="!mt-2"
                      loading={isRemovingLiquidity || isSimulatingRemoveLiquidity}
                      disabled={!removeLiquidity}
                      onClick={() => removeLiquidity?.()}
                    >
                      Withdraw
                    </Button>
                  )}
                  {isPreferNative && (
                    <Button
                      name="removeLiquidityETH"
                      scale={1.25}
                      className="!mt-2"
                      loading={isRemovingLiquidityETH || isSimulatingRemoveLiquidityETH}
                      disabled={!removeLiquidityETH}
                      onClick={() => removeLiquidityETH?.()}
                    >
                      Withdraw
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hidden w-full mt-4 col-span-5">
          <div className="flex flex-col space-y-2 p-7 border border-neutral-200 dark:border-neutral-800 rounded-lg ">
          </div>
        </div>
      </div>
    </div >
  )
}

export default PoolWithdrawalPanel;
