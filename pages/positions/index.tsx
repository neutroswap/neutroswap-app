"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Button, Table, Loading, useTheme } from "@geist-ui/core";
import NoContentDark from "@/public/states/empty/dark.svg";
import NoContentLight from "@/public/states/empty/light.svg";
import ImportLogo from "@/public/logo/import.svg";
import CirclePlus from "@/public/logo/pluscircle.svg";
import Input from "@/components/elements/Input";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { TableColumnRender } from "@geist-ui/core/esm/table";
import { handleImageFallback } from "@/shared/helpers/handleImageFallback";
import { currencyFormat } from "@/shared/utils";
import NewPositionModal from "@/components/modules/Modal/NewPositionModal";
import ImportTokenModal from "@/components/modules/Modal/ImportTokenModal";
import SpNftModal from "@/components/modules/Modal/SpNftModal";
import {
  useQuery as useTanstackQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Client, Provider, cacheExchange, fetchExchange, useQuery } from "urql";
import { useRouter } from "next/router";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { tokens } from "@/shared/statics/tokenList";
import {
  DEFAULT_CHAIN_ID,
  SupportedChainID,
  supportedChainID,
} from "@/shared/types/chain.types";
import { Token } from "@/shared/types/tokens.types";
import { FACTORY_CONTRACT } from "@/shared/helpers/contract";
import { NEUTRO_FACTORY_ABI } from "@/shared/abi";
import { ethers } from "ethers";
import { classNames } from "@/shared/helpers/classNamer";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { TokenPicker } from "@/components/modules/swap/TokenPicker";
import { ThemeType } from "@/shared/hooks/usePrefers";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import getNFTPosition from "@/shared/getters/getNFTPosition";
import { urls } from "@/shared/config/urls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import { Response } from "@/shared/getters/getNFTPosition";
import { waitForTransaction } from "@wagmi/core";
import { decodeAbiParameters, parseAbiParameters } from "viem";

// export default function Positions() {
//   const { address } = useAccount();
//   const searchRef = useRef<any>(null);

//   const [allPositions, setAllPositions] = useState<Array<User>>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSearching, setIsSearching] = useState<boolean>(false);
//   const [selectedRow, setSelectedRow] = useState<User>();

//   // const { data, error, isFetching } = useTanstackQuery({
//   //   queryKey: ["spnft.positions"],
//   //   queryFn: async () => {
//   //     const response = await getNFTPosition(
//   //       address
//   //         ? (address.toLowerCase() as `0x${string}`)
//   //         : "0x0000000000000000000000000000000000000000"
//   //     );
//   //     if (!response) throw new Error("Cannot fetch spnft.positions");
//   //     return response;
//   //   },
//   //   refetchOnWindowFocus: false,
//   // });

//   // if (isFetching) return <Loading scale={3} />;

//   type User = {
//     name: string;
//     token0Logo: string;
//     token1Logo: string;
//     totalStaked?: string;
//     totalStakedInUsd?: string;
//     pendingTokens?: string;
//     pendingTokensInUsd?: string;
//   };

//   const tokenNameColumnHandler: TableColumnRender<User> = (
//     value,
//     rowData,
//     index
//   ) => {
//     return (
//       <div className="flex space-x-3 items-center my-5">
//         <div className="flex -space-x-2 relative z-0">
//           <img
//             src={rowData.token0Logo}
//             className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
//             onError={(e) => {
//               handleImageFallback(rowData.token0Logo, e);
//             }}
//           />
//           <img
//             src={rowData.token1Logo}
//             className="w-7 h-7 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-neutral-900"
//             onError={(e) => {
//               handleImageFallback(rowData.token1Logo, e);
//             }}
//           />
//         </div>
//         <div className="space-x-1 font-semibold text-neutral-800 dark:text-neutral-200">
//           <span>{rowData.name.split("-")[0]}</span>
//           <span className="text-neutral-400 dark:text-neutral-600">-</span>
//           <span>{rowData.name.split("-")[1]}</span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     // <Provider value={nftClient}>
//     //   <QueryClientProvider client={queryClient}>
//     <div className="flex flex-col items-center sm:items-start justify-between py-16">
//       <div className="flex justify-between items-center w-full">
//         <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
//           Positions
//         </span>
//         <Modal>
//           <ModalOpenButton>
//             <Button auto className="!mt-2" iconRight={<PlusIcon />}>
//               Add Liquidity
//             </Button>
//           </ModalOpenButton>
//           <ModalContents>
//             {({ close }) => <AddLiquidityModal handleClose={close} />}
//           </ModalContents>
//         </Modal>
//       </div>
//       <div className="flex flex-col">
//         <p className="m-0 text-center text-base text-neutral-400 mt-2">
//           Create and manage all your staking positions.
//         </p>
//       </div>
//       <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />

//       <Tabs initialValue="1" className="w-full">
//         <Tabs.Item label="spNFTs" value="1">
//           <Card className="-mt-3 overflow-x-auto w-full">
//             <div className="flex justify-between items-center">
//               <span className="text-2xl font-semibold">spNFTs</span>
//               <div className="flex">
//                 <SpNftModal />
//               </div>
//             </div>
//             <div className="flex items-center justify-between space-x-4 w-full mt-7">
//               <div className="flex flex-grow items-center">
//                 <Input
//                   type="text"
//                   //   ref={searchRef}
//                   placeholder="Search"
//                   // onChange={handleSearchAll}
//                 />
//               </div>
//             </div>
//             {/* {Boolean(allPositions.length) && ( */}
//             <div className="overflow-x-scroll mt-8 p-0">
//               <Table
//                 data={allPositions}
//                 rowClassName={() => "cursor-pointer"}
//                 className="min-w-max"
//                 emptyText="Loading..."
//                 onRow={(rowData) => {
//                   setIsOpen(true);
//                   setSelectedRow(rowData);
//                 }}
//               >
//                 <Table.Column
//                   prop="name"
//                   label="Token"
//                   render={tokenNameColumnHandler}
//                   width={380}
//                 />
//                 <Table.Column
//                   prop="amount"
//                   label="Amount"
//                   render={(value) => <span>$ {currencyFormat(+value)}</span>}
//                 />
//                 <Table.Column
//                   prop="setttings"
//                   label="Settings"
//                   // render={(value) => (
//                   //   <span>{currencyFormat(Number(value.rps) * 86400)} NEUTRO</span>
//                   // )}
//                 />
//                 <Table.Column
//                   prop="apr"
//                   label="APR"
//                   render={(_value, rowData: User | any) => (
//                     <span>{+rowData.details.apr} %</span>
//                   )}
//                 />
//                 <Table.Column
//                   prop="pending"
//                   label="Pending Rewards"
//                   // render={(value) => (
//                   //   <span>
//                   //     {currencyFormat(Number(value.rps) * 86400)} NEUTRO
//                   //   </span>
//                   // )}
//                 />
//                 <Table.Column prop="nothing" label="" />
//               </Table>
//             </div>
//             {/* )} */}
//           </Card>
//         </Tabs.Item>

//         <Tabs.Item label="LP v1" value="2">
//           <Card className="-mt-3 overflow-x-auto w-full">
//             <div className="flex items-center">
//               <span className="text-2xl font-semibold">LP V1</span>
//             </div>
//           </Card>
//         </Tabs.Item>
//       </Tabs>
//     </div>
//     //   </QueryClientProvider>
//     // </Provider>
//   );
// }

function SPNFTPool() {
  const theme = useTheme();
  const { address } = useAccount();

  const { data, error, isFetching } = useTanstackQuery({
    queryKey: ["spnft.positions"],
    queryFn: async () => {
      const response = await getNFTPosition(
        address
          ? (address.toLowerCase() as `0x${string}`)
          : "0x0000000000000000000000000000000000000000"
      );
      if (!response) throw new Error("Cannot fetch spnft.positions");
      return response;
    },
    refetchOnWindowFocus: false,
  });

  if (isFetching) return <Loading scale={3} />;

  if (error || !data || !data.length) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="mt-8 text-center rounded-lg md:border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full max-w-3xl">
          <div className="flex flex-col items-center w-full md:p-8">
            {(theme.type as ThemeType) === "nlight" && (
              <NoContentLight className="w-40 h-40 opacity-75" />
            )}
            {(theme.type as ThemeType) === "ndark" && (
              <NoContentDark className="w-40 h-40 opacity-75" />
            )}
            <p className="text-neutral-500 w-3/4">
              You do not have any liquidity positions. Add some liquidity to
              start earning.
            </p>

            <Modal>
              <ModalOpenButton>
                <Button className="!mt-2">Add Liquidity</Button>
              </ModalOpenButton>
              <ModalContents>
                {({ close }) => <AddLiquidityModal handleClose={close} />}
              </ModalContents>
            </Modal>
          </div>
        </div>
      </div>
    );
  }

  // return (
  // <div className="flex flex-col items-center sm:items-start justify-between py-16">
  //   <div className="flex justify-between items-center w-full">
  //     <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
  //       Positions
  //     </span>
  //     <Modal>
  //       <ModalOpenButton>
  //         <Button auto className="!mt-2" iconRight={<PlusIcon />}>
  //           Add Liquidity
  //         </Button>
  //       </ModalOpenButton>
  //       <ModalContents>
  //         {({ close }) => <AddLiquidityModal handleClose={close} />}
  //       </ModalContents>
  //     </Modal>
  //   </div>
  //   <div className="flex flex-col">
  //     <p className="m-0 text-center text-base text-neutral-400 mt-2">
  //       Create and manage all your staking positions.
  //     </p>
  //   </div>
  //   <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
  //   //{" "}
  //   {/* <div className="flex justify-center items-center w-full">
  // //       <div className="mt-8 text-center rounded-lg md:border border-neutral-200 dark:border-neutral-800/50 md:shadow-dark-sm md:dark:shadow-dark-lg w-full max-w-3xl">
  // //         <div className="flex flex-col items-center w-full md:p-8">
  // //           {(theme.type as ThemeType) === "nlight" && (
  // //             <NoContentLight className="w-40 h-40 opacity-75" />
  // //           )}
  // //           {(theme.type as ThemeType) === "ndark" && (
  // //             <NoContentDark className="w-40 h-40 opacity-75" />
  // //           )}
  // //           <p className="text-neutral-500 w-3/4">
  // //             You do not have any liquidity positions. Add some liquidity to
  // //             start earning.
  // //           </p>

  // //           <Modal>
  // //             <ModalOpenButton>
  // //               <Button className="!mt-2">Add Liquidity</Button>
  // //             </ModalOpenButton>
  // //             <ModalContents>
  // //               {({ close }) => <AddLiquidityModal handleClose={close} />}
  // //             </ModalContents>
  // //           </Modal>
  // //         </div>
  // //       </div>
  // //     </div> */}
  //   //{" "}
  // </div>;
  // );

  return (
    <div className="flex flex-col items-center sm:items-start justify-between py-16">
      <div className="flex justify-between items-center w-full">
        <span className="m-0 text-center text-3xl md:text-4xl font-semibold">
          Positions
        </span>
        <Modal>
          <ModalOpenButton>
            <Button auto className="!mt-2" iconRight={<PlusIcon />}>
              Add Liquidity
            </Button>
          </ModalOpenButton>
          <ModalContents>
            {({ close }) => <AddLiquidityModal handleClose={close} />}
          </ModalContents>
        </Modal>
      </div>
      <div className="flex flex-col">
        <p className="m-0 text-center text-base text-neutral-400 mt-2">
          Create and manage all your staking positions.
        </p>
      </div>
      <hr className="w-full border-neutral-200/80 dark:border-neutral-800/80 my-5" />
      <div
        className={classNames(
          "relative flex flex-col w-full border rounded-lg bg-white dark:bg-neutral-900/75 shadow-lg shadow-slate-200 dark:shadow-black/50 overflow-hidden"
        )}
      >
        <Table>
          <TableHeader className="border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead>Staked spNFT</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-center">Settings</TableHead>
              <TableHead className="text-center">APR</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((pool) => (
              <SpNftModal key={pool.id} data={pool}>
                <TableRow
                  className="cursor-pointer group"
                  // @ts-ignore
                  type="tr"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex items-center -space-x-2 mr-2">
                        <img
                          src={pool.assets.token0.logo}
                          className={classNames("h-6 rounded-full")}
                        />
                        <img
                          src={pool.assets.token1.logo}
                          className={classNames("h-6 rounded-full")}
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mr-4">
                          <p className="font-semibold">
                            {pool.assets.token0.symbol}
                          </p>
                          <p className="font-semibold text-muted-foreground">
                            /
                          </p>
                          <p className="font-semibold">
                            {pool.assets.token1.symbol}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground tracking-wide">
                          #ID-{pool.tokenId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-left font-medium">
                        {currencyFormat(+pool.amount)}
                      </span>
                      <span className="text-left"></span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center"></TableCell>
                </TableRow>
              </SpNftModal>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();
export default function PoolPosition() {
  const { chain } = useNetwork();

  const factoryClient = new Client({
    url: urls[DEFAULT_CHAIN_ID].FACTORY_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  const nftClient = new Client({
    url: urls[DEFAULT_CHAIN_ID].NFT_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  return (
    <Tabs defaultValue="spnft" className="w-full">
      <TabsList>
        <TabsTrigger value="spnft">spNFT</TabsTrigger>
        <TabsTrigger value="lp">Liquidity V2</TabsTrigger>
      </TabsList>
      <TabsContent value="spnft">
        <Provider value={nftClient}>
          <QueryClientProvider client={queryClient}>
            <SPNFTPool />
          </QueryClientProvider>
        </Provider>
      </TabsContent>
      <TabsContent value="lp"></TabsContent>
    </Tabs>
  );
}

const AddLiquidityModal: React.FC<{ handleClose: () => void }> = ({
  handleClose,
}) => {
  const router = useRouter();
  const { chain } = useNetwork();

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any))
      return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID];
  }, [chain]);

  const [token0, setToken0] = useState<Token>(chainSpecificTokens[0]);
  const [token1, setToken1] = useState<Token>(chainSpecificTokens[1]);

  const {
    data: existingPool,
    isError,
    isLoading: isFetchingGetPair,
  } = useContractRead({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "getPair",
    args: [token0.address, token1.address],
  });

  const { config: createPairConfig } = usePrepareContractWrite({
    address: FACTORY_CONTRACT,
    abi: NEUTRO_FACTORY_ABI,
    functionName: "createPair",
    args: [token0.address, token1.address],
  });
  const { isLoading: isCreatingPair, write: createPair } = useContractWrite({
    ...createPairConfig,
    onSuccess: async (result) => {
      const tx = await waitForTransaction({
        hash: result.hash,
        confirmations: 8,
      });
      const decodedResult = decodeAbiParameters(
        parseAbiParameters("address, uint256"),
        tx.logs[0].data
      );
      router.push(`/pool/${decodedResult[0]}`);
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-black dark:text-white mb-8">
        <div>
          <p className="text-left text-xl font-semibold m-0">Add Liquidity</p>
          <p className="text-sm m-0 opacity-50">
            Select token pair to add liquidty
          </p>
        </div>
        <button type="button" onClick={handleClose}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400 opacity-30" />
        </button>
      </div>

      <TokenPicker
        selectedToken={token0}
        setSelectedToken={setToken0}
        disabledToken={token1}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-b-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  1
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      <TokenPicker
        selectedToken={token1}
        setSelectedToken={setToken1}
        disabledToken={token0}
      >
        {({ selectedToken }) => (
          <div
            className={classNames(
              "py-1 px-4 rounded-2xl rounded-t-none cursor-pointer transition-colors group",
              "bg-neutral-100 dark:bg-neutral-900",
              "hover:bg-neutral-200/75 hover:dark:bg-neutral-800/60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-neutral-500 dark:text-neutral-600">
                  2
                </p>
                <img
                  alt={`${selectedToken.name} Icon`}
                  src={selectedToken.logo}
                  className="h-7 mr-2 rounded-full"
                  onError={(event) => {
                    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${selectedToken.symbol}`;
                  }}
                />
                <span className="text-sm font-semibold text-black dark:text-white">
                  {selectedToken.symbol}
                </span>
              </div>
              <ChevronRightIcon className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-all text-black dark:text-white" />
            </div>
          </div>
        )}
      </TokenPicker>
      {(!existingPool ||
        existingPool !== "0x0000000000000000000000000000000000000000") && (
        <Button
          scale={1.25}
          className={classNames(
            "!w-full !mt-4 !bg-transparent !rounded-lg",
            "!border-neutral-300 dark:!border-neutral-700",
            "hover:!border-neutral-400 dark:hover:!border-neutral-600",
            "focus:!border-neutral-400 dark:focus:!border-neutral-600",
            "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
            "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
          )}
          disabled={isError}
          loading={isFetchingGetPair}
          onClick={() => router.push(`/pool/${existingPool}`)}
        >
          <span>Enter pool</span>
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </Button>
      )}
      {existingPool === "0x0000000000000000000000000000000000000000" && (
        <div>
          <Button
            scale={1.25}
            className={classNames(
              "!w-full !mt-4 !bg-transparent !rounded-lg",
              "!border-neutral-300 dark:!border-neutral-700",
              "hover:!border-neutral-400 dark:hover:!border-neutral-600",
              "focus:!border-neutral-400 dark:focus:!border-neutral-600",
              "focus:hover:!border-neutral-400 dark:focus:hover:!border-neutral-600",
              "disabled:opacity-50 disabled:hover:!border-neutral-300 disabled:dark:hover:!border-neutral-700"
            )}
            disabled={!createPair}
            loading={isCreatingPair}
            onClick={() => createPair?.()}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            <span>Start adding liquidity</span>
          </Button>
          <p className="max-w-3xl mx-auto text-sm text-neutral-400 dark:text-neutral-600 text-center">
            No pool found! But, you can create it now and start providing
            liquidity.
          </p>
        </div>
      )}
    </div>
  );
};
