import useSWR from 'swr';
import { Farm } from '@/shared/types/farm.types';

export type OwnedFarm = Farm & {
  details: {
    totalStaked: string,
    totalStakedInUsd: string,
    pendingTokens: string,
    pendingTokensInUsd: string
  }
}

type GetUserFarmsResponse = {
  holdings: string,
  totalPendingTokens: string,
  totalPendingTokenInUsd: string,
  farms: OwnedFarm[],
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const result = await res.json();
  return result.data
})

export default function useUserFarms(address?: `0x${string}`) {
  const swr = useSWR<GetUserFarmsResponse>(`/api/getUserFarm?userAddress=${address}`, fetcher)
  return swr
}
