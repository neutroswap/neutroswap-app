'use client'

import { Content } from "@/.contentlayer/generated";
import { getFairAuctionPrice } from "@/shared/gql/queries/launchpad";
import dayjs from "dayjs";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts"
import { useQuery } from "urql";

type Props = {
  contract: `0x${string}`,
  symbol: string
}

export default function PriceTracker({ contract, symbol }: Props) {
  const [{ data: response, fetching, error }, reexecuteQuery] = useQuery({
    pause: !contract,
    query: getFairAuctionPrice,
    variables: {
      id: contract
    },
  });

  if (!response || !response.fairAuction || !response.fairAuction.priceTracker) {
    return (
      <div>
        No data
      </div>
    )
  }

  const res = response.fairAuction.priceTracker;
  return (
    <ResponsiveContainer
      width="100%"
      height={350}
    >
      <AreaChart
        data={res}
        margin={{ top: 10, right: 0, left: -32, bottom: 0 }}
      >
        <defs>
          <linearGradient id="currentPriceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="5 5" />
        <XAxis
          dataKey="timestamp"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => dayjs.unix(value).format('DD/MM HH:mm')}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Area
          type="step"
          activeDot={true}
          dataKey="currentPrice"
          stroke="hsl(var(--primary))"
          fill="url(#currentPriceFill)"
        />
        <Tooltip content={<CustomTooltip symbol={symbol} />} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({ active, payload, label, symbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg px-2 py-1.5 shadow">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">{payload[0].value} {symbol}</p>
          <p className="text-xs text-muted-foreground/60">{dayjs.unix(label).format('MM/DD/YYYY (HH:mm)')}</p>
        </div>
        {/* <p className="desc">Anything you want can be displayed here.</p> */}
      </div>
    );
  }

  return null;
};
