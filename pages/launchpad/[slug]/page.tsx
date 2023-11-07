import { format, parseISO } from "date-fns";
import { allContents } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import LaunchpadSteps from "../modules/LaunchpadSteps";
import {
  cn,
  currencyCompactFormat,
  currencyFormat,
  truncateAddress,
} from "@/lib/utils";
import Sidebar from "../modules/LaunchpadSidebar";
import { Book, Github, Share2, TwitterIcon } from "lucide-react";
import { urls } from "@/lib/config/urls";
import { DEFAULT_CHAIN } from "@/lib/config/chains";
import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { getFairAuction } from "@/lib/gql/queries/launchpad";
import PriceTracker from "../modules/PriceTracker";
import LaunchpadSubgraphProvider from "../modules/LaunchpadSubgraphProvider";
import TokenLogo from "@/components/TokenLogo";
import { formatEther, formatUnits, parseEther } from "viem";
import ReferralCard from "../modules/ReferralCard";

export const generateStaticParams = async () =>
  allContents.map((content) => ({ slug: content._raw.flattenedPath }));

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const generateMetadata = ({ params }: Props) => {
  const post = allContents.find(
    (post) => post._raw.flattenedPath === params.slug
  );
  if (!post) return { title: "Launchpad" };
  return { title: post.title };
};

const PostLayout = async ({ params }: { params: { slug: string } }) => {
  const post = allContents.find(
    (post) => post._raw.flattenedPath === params.slug
  );

  if (!post) {
    return <>Not found</>;
  }

  const client = new Client({
    url: urls[DEFAULT_CHAIN.id].LAUNCHPAD_GRAPH_URL,
    exchanges: [cacheExchange, fetchExchange],
  });

  const res = await client
    .query(getFairAuction, { id: post.contract.toLowerCase() })
    .toPromise();

  const data = res.data;
  if (!data) return <p>No Auction Data</p>;
  const auction = data.fairAuction;
  if (!auction) return <p>No Auction ${post.contract} found</p>;

  const Content = getMDXComponent(post.body.code);

  return (
    <div className="flex flex-col items-center py-6 space-y-4 min-h-[80vh]">
      <div className="flex w-full py-2 justify-between items-center">
        <div>
          <time dateTime={post.date} className="mb-1 text-xs text-gray-600">
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </time>
          <p className="text-2xl font-semibold">{post.title} Token Sale</p>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {truncateAddress(post.contract, 4)}
          </p>
        </div>
        <div className="flex items-center space-x-4 text-muted-foreground mt-4">
          <Github className="w-5 h-5" />
          <TwitterIcon className="w-5 h-5" />
          <Book className="w-5 h-5" />
          <Share2 className="w-5 h-5" />
        </div>
      </div>

      <div className="relative flex gap-x-8 gap-y-6">
        <div className="w-full lg:w-4/6">
          <div
            className={cn(
              "p-4",
              "relative grid grid-cols-1 sm:grid-cols-4 sm:divide-x gap-4 border rounded-lg bg-white dark:bg-slate-900/50 shadow shadow-slate-200 dark:shadow-black overflow-hidden"
            )}
          >
            <div className="flex sm:flex-col items-center justify-between sm:justify-center">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Raise Target
              </p>
              <div className="flex items-center space-x-1">
                <p className="text-xl">
                  {currencyCompactFormat(
                    +formatUnits(
                      BigInt(auction.minToRaise),
                      Number(auction.saleTokenDecimals)
                    )
                  )}
                </p>
                <TokenLogo
                  src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/${post.raise.symbol.toLowerCase()}.svg`}
                  className="w-5 h-5 ml-2"
                />
              </div>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {post.symbol} Price
              </p>
              <p className="text-xl">
                ${auction.priceTracker?.[0] === undefined ? "0" : auction.priceTracker?.[0].currentPrice}
              </p>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                Circ. Market Cap
              </p>
              <p className="text-xl">
                ${currencyCompactFormat(
                  +formatEther(BigInt(auction.circMarketCap))
                )}
              </p>
            </div>
            <div className="flex sm:flex-col items-center justify-between sm:justify-center">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                FDV
              </p>
              <p className="text-xl">
                {currencyCompactFormat(post.raise.maxSupply * auction.finalPrice)}
              </p>
            </div>
          </div>

          <div className={cn("w-full mt-4")}>
            <LaunchpadSteps data={post} />
          </div>

          <div className={cn("w-full mt-4")}>
            <div
              className={cn(
                "p-4",
                "relative border rounded-lg bg-white dark:bg-slate-900/50 shadow shadow-slate-200 dark:shadow-black overflow-hidden"
              )}
            >
              <LaunchpadSubgraphProvider>
                <PriceTracker
                  symbol={post.raise.symbol}
                  contract={post.contract as `0x${string}`}
                />
              </LaunchpadSubgraphProvider>
            </div>
          </div>

          <div className="block lg:hidden mt-4">
            <Sidebar data={post} auction={auction} />
          </div>

          <div>
            <article className="prose lg:prose-lg prose-slate dark:prose-invert max-w-screen-2xl">
              <Content />
            </article>
          </div>

          {/* <ReferralCard /> */}

          <div className="bg-destructive/10 border rounded-lg border-destructive/50 p-4 space-y-2">
            <p className="text-sm text-destructive dark:text-destructive-foreground font-medium">
              Esper Finance is a suite of decentralized contracts built to
              support Mantle native builders. As a permissionless protocol,
              Esper bears no responsibility for any tokens purchased using its
              contracts.
            </p>
            <p className="text-sm text-destructive dark:text-destructive-foreground font-medium">
              All users are taking full responsibility that they are aware of
              the relevant risks involved, and that they are participating for a
              token that is completely independent and not associated with Esper
              in any way. Social media posts and visible information on the
              Esper app in no way counts as an endorsement of a protocol by the
              Esper team, and nothing posted or shared in any Esper media is a
              recommendation or financial advice.
            </p>
          </div>
        </div>

        <div className="hidden lg:block w-2/6">
          <div className="sticky top-10">
            <Sidebar data={post} auction={auction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLayout;
