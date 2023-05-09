import useSWR from 'swr';
import { Vault } from '@/shared/types/vault.types';

export type OwnedVault = Vault & {
  vaults: {
  totalDeposit: string,
  totalDepositInUsd: string,
  pendingTokens: string,
  pendingTokensInUsd: string,
  unlockAt: string
  }
}

type GetUserVaultsResponse = {
  holdings: string,
  totalHoldingsInUsd: string,
  totalPendingTokens: string,
  totalPendingTokensInUsd: string,
  vaults: OwnedVault[],
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const { data }: { data: GetUserVaultsResponse } = await res.json();
  // const filteredVault = data.vaults.filter((vault) => {
  //   return +vault.details.totalStaked > 0
  // })
  return data
})

export default function useUserVaults(address?: `0x${string}`) {
  const swr = useSWR<GetUserVaultsResponse>(`/api/getUserVault?userAddress=${address}`, fetcher)
  return swr
}
