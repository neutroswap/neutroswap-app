import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/elements/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/elements/ui/collapsible";
import { LAUNCHPAD_POOL_ABI } from "@/shared/abi/launchpad-pool.abi";
import { cn } from "@/shared/utils";
import { CaretDown, Copy, DownloadSimple, ShareNetwork } from "@phosphor-icons/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useCopyToClipboard, useEffectOnce, useLocalStorage } from "usehooks-ts";
import { formatEther, formatUnits } from "viem";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";

type Props = {
  launchpadPoolContract: `0x${string}`
  saleTokenDecimals: number,
}

export default function ReferralCard(props: Props) {
  const searchParams = useSearchParams()
  const [referrer, setReferrer] = useLocalStorage('esper.referrer', "")

  useEffectOnce(() => {
    // when mounted, check if referrer is present
    if (!!referrer) return;
    // if not, use the ref from router query
    const ref = searchParams?.get('ref')
    // if no query present, referrer will stay on default
    if (!ref) return;
    // else, check if the ref params is valid, then store it
    fetch(new Request("/api/recover", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referral_code: ref })
    }))
      .then((res) => {
        if (res.status !== 200) return console.error("Invalid Ref"); // invalid ref
        return res.json();
      })
      .then((res) => setReferrer(res.referrer))
  })

  return (
    <div className={cn(
      "p-6 mb-6",
      "relative border-[3px] border-dotted rounded-lg overflow-hidden",
    )}>
      <p className="text-lg font-medium">Refer to Earn</p>

      <div className="space-y-2 mt-4">
        <p className="text-sm text-muted-foreground">When someone invests through your link, you will earn 3% in form of USDC. That commission is sent directly to your wallet once the referred deposit is made.</p>
        <p className="text-sm text-muted-foreground">Your referral doesn&apos;t affect the referred user&apos;s contribution or the amount of ESPER tokens they receive at the end of the sale, whether they used the link or not.</p>
      </div>

      <div className="flex items-center space-x-4 mt-6">
        <ResponsiveDialog.Root shouldScaleBackground>
          <ResponsiveDialog.Trigger>
            <Button variant="outline" className="rounded-lg">
              <span>Share Referral Link</span>
              <ShareNetwork className="w-4 h-4 ml-2" />
            </Button>
          </ResponsiveDialog.Trigger>
          <ResponsiveDialog.Content>
            <ReferralModal {...props} />
          </ResponsiveDialog.Content>
        </ResponsiveDialog.Root>
        <a
          className="text-sm"
          href="https://docs.esper.finance/esper-finance/or-launchpad"
        >
          Learn more
        </a>
      </div>


      {/*  NOTE: FOR DEBUGGING ONLY */}
      {process.env.NODE_ENV !== "production" && (
        <div className="w-full mt-4 col-span-5">
          <Collapsible className="w-full">
            <CollapsibleTrigger className="w-full flex justify-between items-center group">
              <div className="flex text-muted-foreground group-hover:text-foreground text-sm items-center transition-colors">
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Debug (Dev mode only)
                </p>
                <CaretDown
                  className={cn(
                    "flex ml-2 w-3 h-3",
                    "group-data-[state=open]:-rotate-90"
                  )}
                  weight="bold"
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="CollapsibleContent">
              <pre className="mt-1 text-sm max-w-xs">
                {JSON.stringify({
                  referrer: referrer,
                }, null, 4)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  )
}

function ReferralModal(props: Props) {
  const pathname = usePathname()
  const { address } = useAccount();
  const [value, copy] = useCopyToClipboard();

  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const referralLink = `${window.location.protocol}//${window.location.host}${pathname}?ref=${referralCode}`

  const launchpadPoolContract = {
    address: props.launchpadPoolContract,
    abi: LAUNCHPAD_POOL_ABI,
  } as const;

  const { data: userInfoResponse } = useContractRead({
    enabled: Boolean(address),
    ...launchpadPoolContract,
    functionName: 'userInfo',
    args: [address!]
  })

  const userInfo = useMemo(() => {
    if (!userInfoResponse) return;
    const [contribution, referrer, referralEarnings, claimedRefEarnings, hasClaimed] = userInfoResponse;
    return { contribution, referrer, referralEarnings, claimedRefEarnings, hasClaimed }
  }, [userInfoResponse])

  const claimableEarnings = !userInfo ? BigInt(0) : userInfo.referralEarnings - userInfo.claimedRefEarnings

  const { config: claimRefEarningsConfig } = usePrepareContractWrite({
    ...launchpadPoolContract,
    functionName: 'claimRefEarnings',
  })
  const {
    write: claimRefEarnings,
    isLoading: isClaimingRefEarnings
  } = useContractWrite(claimRefEarningsConfig)

  useEffectOnce(() => {
    setLoading(true);
    fetch(new Request("/api/verify", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address })
    }))
      .then((res) => {
        if (res.status !== 200) return console.error("Ref not implemented"); // invalid ref
        return res.json();
      })
      .then((res) => setReferralCode(res.referral_code))
      .finally(() => setLoading(false))
  })

  const generateReferralLink = useCallback(() => {
    setLoading(true);
    fetch(new Request("/api/generate", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address })
    }))
      .then((res) => {
        if (res.status !== 200) return console.error("Invalid Ref"); // invalid ref
        return res.json();
      })
      .then((res) => {
        setReferralCode(res.referral_code)
      })
      .finally(() => setLoading(false))
  }, [address])

  return (
    <div className="p-4">
      <div>
        <p className="font-semibold">Share your referral link</p>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Your Earnings</p>
            <p className="text-3xl font-semibold">${formatUnits(claimableEarnings, props.saleTokenDecimals)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="uppercase text-xs"
            loading={isClaimingRefEarnings}
            disabled={!claimRefEarnings}
            onClick={() => claimRefEarnings?.()}
          >
            <span>Claim Earnings</span>
            <DownloadSimple className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Comission Receiver Address</p>
          <p className="text-sm font-mono">{address}</p>
        </div>

        <div className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground">
            When others access through the link below, you will receive 3% as commision and it will be sent directly after they made a deposit.
          </p>
          <p className="text-sm text-muted-foreground">
            If you prefer a different receiver, please switch to your preferred address and generate a new referral link.
          </p>
        </div>

        {!referralCode && (
          <Button
            className={cn(
              "w-full uppercase font-semibold tracking-tight mt-6"
            )}
            loading={loading}
            onClick={() => generateReferralLink()}
          >
            Generate Referral Link
          </Button>
        )}

        {!!referralCode && (
          <div className="relative p-3 bg-secondary dark:bg-secondary/50 border rounded-lg mt-6 group overflow-hidden">
            <button
              className="hidden group-hover:flex absolute inset-0 rounded-lg items-center justify-center bg-background/5 backdrop-blur-md w-full h-full animate-in fade-in z-0"
              onClick={() => copy(referralLink)}
            >
              {value !== referralLink && <p className="text-sm animate-in fade-in">Click to Copy</p>}
              {value === referralLink && <p className="text-sm animate-in fade-in">Copied!</p>}
            </button>
            <p className="text-sm font-mono truncate max-w-md">{referralLink}</p>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-1 right-1"
              onClick={() => copy(referralLink)}
            >
              <Copy className="w-4 h-4 transition" weight={value !== referralLink ? "regular" : "fill"} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
