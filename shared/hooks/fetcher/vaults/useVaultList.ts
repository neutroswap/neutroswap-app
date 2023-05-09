import useSWR from 'swr';
import { Vault } from '@/shared/types/vault.types';

export type AvailableVault = Vault & {
  details: {
    apr: string,
    rps: string
  }
}

type GetListVaultsResponse = {
  totalVaultValue: string,
  vaults: AvailableVault[],
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const result = await res.json();
  return result.data
})

export default function useVaultList() {
  const swr = useSWR<GetListVaultsResponse>('/api/getListVault', fetcher)
  return swr
}
