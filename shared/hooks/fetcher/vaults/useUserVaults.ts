import useSWR from 'swr';
import { Vault } from '@/shared/types/vault.types';

export type OwnedVault = Vault & {
  details: {
    totalStaked: string,
    totalStakedInUsd: string,
    pendingTokens: string,
    pendingTokensInUsd: string
  }
}

type GetUserVaultsResponse = {
  holdings: string,
  totalPendingTokens: string,
  totalPendingTokenInUsd: string,
  vaults: OwnedVault[],
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const { data }: { data: GetUserVaultsResponse } = await res.json();
  const filteredFarm = data.vaults.filter((vault) => {
    return +vault.details.totalStaked > 0
  })
  return { ...data, farms: filteredFarm }
})

export default function useUserVaults(address?: `0x${string}`) {
  const swr = useSWR<GetUserVaultsResponse>(`/api/getUserVault?userAddress=${address}`, fetcher)
  return swr
}
