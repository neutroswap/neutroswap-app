import useSWR from 'swr';
import { Vault } from '@/shared/types/vault.types';

export type AvailableVault = Vault & {
  details: {
    totalLiquidity: string,
    apr: string,
    rps: string
  }
}

type GetListVaultsResponse = {
  farms: AvailableVault[],
  tvl: string
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const result = await res.json();
  return result.data
})

export default function useVaultList() {
  const swr = useSWR<GetListVaultsResponse>('/api/getVaultFarm', fetcher)
  return swr
}
