import useSWR from 'swr';
import { Farm } from '@/shared/types/farm.types';

export type AvailableFarm = Farm & {
  details: {
    totalLiquidity: string,
    apr: string,
    rps: string
  }
}

type GetListFarmsResponse = {
  farms: AvailableFarm[],
  tvl: string
}

const fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => fetch(input, init).then(async (res) => {
  const result = await res.json();
  return result.data
})

export default function useFarmList() {
  const swr = useSWR<GetListFarmsResponse>('/api/getListFarm', fetcher)
  return swr
}
