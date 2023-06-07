import { Button, Tabs, Text, useTheme } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import AltLogo from "@/public/alt_logo.svg";
import { useRouter } from "next/router";
import { MoonIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, SunIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { classNames } from "@/shared/helpers/classNamer";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useMemo } from "react";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const router = useRouter();
  const theme = useTheme();

  const tabs = useMemo(() => {
    return [
      {
        label: "Swap",
        value: "/",
        hidden: false,
      },
      {
        label: "Pool",
        value: "/pool",
        hidden: false,
      },
      {
        label: "Farm",
        value: "/farm",
        hidden: false,
      },
      {
        label: "Vault",
        value: "/vault",
        hidden: false,
      },
      {
        label: "Launchpad",
        value: "/launchpad",
        hidden: false,
      },
      {
        label: "Dividend",
        value: "/dividend",
        hidden: false,
      },
      {
        label: "Analytics",
        value: "/analytics",
        hidden: false,
      },
      {
        label: "Presales",
        value: "/presales",
        hidden: true,
      },
    ];
  }, []);

  return (
    <>
      <div className="fixed top-0 w-full border-b-[0.5px] border-neutral-300 dark:border-white/[.15] bg-gradient-to-b from-white dark:from-black to-transparent backdrop-blur-lg z-10 p-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto pt-3 md:py-3 px-4 lg:px-0  submenu__inner">
          <Link href="/">
            <Logo className="h-6 lg:h-6 text-black dark:text-white mr-4" />
          </Link>
          <Tabs
            hideDivider
            hideBorder
            onChange={(route) => router.push(route)}
            className="hidden lg:block !w-full"
            initialValue={"/" + router.asPath.split("/")[1]}
          >
            {tabs.map((tab) => {
              if (tab.hidden) return null;
              return (
                <Tabs.Item
                  key={tab.label}
                  label={tab.label}
                  value={tab.value}
                />
              );
            })}
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
                const ready = mounted && authenticationStatus !== "loading";
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated");

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
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
                            type="warning-light"
                            ghost
                            iconRight={<ArrowPathIcon />}
                          >
                            Switch Network
                          </Button>
                        );
                      }

                      return (
                        <div className="flex items-center space-x-1">
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
                                  overflow: "hidden",
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
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

                          <button
                            onClick={openAccountModal}
                            className="flex h-8 items-center dark:bg-neutral-900 lg:p-0.5 rounded-md min-w-max shadow border lg:border-0 border-white/5"
                          >
                            <span className="text-sm font-bold mx-1.5">
                              {account.displayBalance
                                ? `${account.displayBalance}`
                                : ""}
                            </span>
                            <button
                              type="button"
                              className={classNames(
                                "hidden lg:flex h-full items-center text-sm px-2 border border-transparent dark:border-white/5 rounded-md font-bold bg-neutral-100 dark:bg-neutral-800",
                                "hover:border-black/15 hover:bg-neutral-200/50 dark:hover:border-white/15 dark:hover:bg-neutral-700/50"
                              )}
                            >
                              {account.displayName}{" "}
                              <ChevronDownIcon className="ml-0.5 w-4 h-4" />
                            </button>
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

        <div className="submenu__inner">
          <Tabs
            hideDivider
            onChange={(route) => router.push(route)}
            className="block lg:hidden !w-full"
            initialValue={"/" + router.asPath.split("/")[1]}
          >
            {tabs.map((tab) => {
              if (tab.hidden) return null;
              return (
                <Tabs.Item
                  key={tab.label}
                  label={tab.label}
                  value={tab.value}
                  className="!p-0"
                />
              );
            })}
          </Tabs>
        </div>
      </div>
      <style jsx>
        {`
          .submenu__inner :global(.content) {
            display: none;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
