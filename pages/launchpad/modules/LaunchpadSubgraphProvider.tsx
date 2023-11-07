'use client'

import { urls } from "@/shared/config/urls";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
import { useNetwork } from "wagmi";
import { DEFAULT_CHAIN_ID } from "@/shared/types/chain.types";

export default function LaunchpadSubgraphProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { chain } = useNetwork();

  const { LAUNCHPAD_GRAPH_URL } = urls[DEFAULT_CHAIN_ID];

  const client = new Client({
    url: LAUNCHPAD_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  return (
    <Provider value={client}>
      {children}
    </Provider>
  )
}
