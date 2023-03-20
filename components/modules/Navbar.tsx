import { Button, Tabs, Text, useTheme } from "@geist-ui/core";
import Logo from "@/public/logo.svg"
import AltLogo from "@/public/alt_logo.svg"
import { useRouter } from "next/router";
import { MoonIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, SunIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { classNames } from "@/shared/helpers/classnames";

interface Props {
}

const Navbar: React.FC<Props> = () => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <>
      <div
        className="border-b-[0.5px] border-white/25 p-3 lg:px-0"
        style={{
          borderColor: theme.palette.border
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto  submenu__inner">
          <Link href="/">
            <Logo className="h-10 lg:h-12 text-black dark:text-white" />
          </Link>
          <Tabs
            hideDivider
            hideBorder
            onChange={(route) => router.push(route)}
            className="hidden lg:block !w-full"
          >
            <Tabs.Item label="Home" value="/" />
            <Tabs.Item label="Mint" value="/mint" />
            <Tabs.Item label="Presales" value="/presales" />
            <Tabs.Item label="Lock" value="/lock" />
            <Tabs.Item label="Multisender" value="/multisender" />
          </Tabs>
          <div className="flex space-x-2">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            auto
                            scale={3 / 4}
                            px={0.6}
                            onClick={openConnectModal}
                          >
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            auto
                            scale={3 / 4}
                            px={0.6}
                            onClick={openChainModal}
                          >
                            Wrong Network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex items-center space-x-1">
                          <div className="flex h-8 items-center dark:bg-neutral-900 p-0.5 rounded-md min-w-max shadow">
                            <span className="text-sm font-bold mx-1.5">
                              {account.displayBalance
                                ? `${account.displayBalance}`
                                : ''}
                            </span>
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className={classNames(
                                "flex h-full items-center text-sm px-2 border border-transparent dark:border-white/5 rounded-md font-bold bg-neutral-100 dark:bg-neutral-800",
                                "hover:border-black/15 hover:bg-neutral-200/50 dark:hover:border-white/15 dark:hover:bg-neutral-700/50"
                              )}
                            >
                              {account.displayName} <ChevronDownIcon className="ml-0.5 w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={openChainModal}
                            type="button"
                            className={classNames(
                              "h-8 w-8 shadow",
                              "flex items-center justify-center text-sm border border-transparent dark:border-white/5 rounded-md font-bold bg-white dark:bg-neutral-900",
                              "hover:border-black/15 hover:bg-neutral-50 dark:hover:border-white/15 dark:hover:bg-neutral-800 "
                            )}
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 18,
                                  height: 18,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 18, height: 18 }}
                                  />
                                )}
                              </div>
                            )}
                            {!chain.hasIcon && (
                              <QuestionMarkCircleIcon className="h-5 w-5 text-white/50" />
                            )}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
      <style jsx>{`
      .submenu__inner :global(.content) {
          display: none;
        }
      `}
      </style>
    </>
  )
}

export default Navbar;
