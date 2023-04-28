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
  const { data }: { data: GetUserFarmsResponse } = await res.json();
  const filteredFarm = data.farms.filter((farm) => {
    return +farm.details.totalStaked > 0
  })
  return { ...data, farms: filteredFarm }
})

export default function useUserFarms(address?: `0x${string}`) {
  const swr = useSWR<GetUserFarmsResponse>(`/api/getUserFarm?userAddress=${address}`, fetcher)
  return swr
}
