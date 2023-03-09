import { Button, Tabs, Text, useTheme } from "@geist-ui/core";
import Logo from "@/public/logo.svg"
import { useRouter } from "next/router";
import { MoonIcon } from "@heroicons/react/24/outline";
import { SunIcon } from "@heroicons/react/24/solid";

interface Props {
  handleThemeSwitch: () => void
}

const Navbar: React.FC<Props> = ({ handleThemeSwitch }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <>
      <div
        className="w-full border-b-[0.5px] border-white/25 py-3"
        style={{
          borderColor: theme.palette.border
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto  submenu__inner">
          <Logo className="h-16 -my-4" />
          <Tabs
            hideDivider
            hideBorder
            onChange={(route) => router.push(route)}
            className="!w-full"
          >
            <Tabs.Item label="Home" value="/" />
            <Tabs.Item label="Mint" value="/mint" />
            <Tabs.Item label="Presales" value="/presales" />
            <Tabs.Item label="Lock" value="/lock" />
            <Tabs.Item label="Multisender" value="/multisender" />
          </Tabs>
          <div className="flex space-x-2">
            <Button
              auto
              onClick={handleThemeSwitch}
              scale={2 / 3}
              px={0.6}
            >
              Connect Wallet
            </Button>
            <Button
              auto
              onClick={handleThemeSwitch}
              icon={(
                <>
                  {theme.type === "dark" && <MoonIcon className="w-4 h-4" />}
                  {theme.type === "light" && <SunIcon className="w-4 h-4" />}
                </>
              )}
              scale={2 / 3}
              px={0.6}
            >
            </Button>
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
