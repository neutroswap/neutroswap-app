import { Button, Tabs, Text, useTheme } from "@geist-ui/core";
import Logo from "@/public/logo.svg"
import { useRouter } from "next/router";

const Navbar = () => {
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
          <Button>Connect Wallet</Button>
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
