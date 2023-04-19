import { Button, Tabs, Text, useTheme } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import AltLogo from "@/public/alt_logo.svg";
import { useRouter } from "next/router";
import { MoonIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, SunIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { classNames } from "@/shared/helpers/classNamer";
import { ThemeType } from "@/shared/hooks/usePrefers";

interface Props {
  handleThemeSwitch: () => void;
}

const Footer: React.FC<Props> = ({ handleThemeSwitch }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <>
      <div
        className="border-t-[0.5px] border-neutral-300 dark:border-white/[.15] p-3 lg:px-0"
        style={{
          borderColor: theme.palette.border,
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto  submenu__inner">
          <p className="text-sm text-neutral-400 dark:text-neutral-600 md:m-0 p-0">
            Copyright &copy; {new Date().getFullYear()} Neutroswap, LLC. All
            rights reserved.
          </p>
          <div></div>
          <div className="flex space-x-2">
            <Button
              auto
              onClick={handleThemeSwitch}
              className="!hidden lg:!block"
              icon={
                <>
                  {theme.type as ThemeType === "ndark" && <MoonIcon className="w-4 h-4" />}
                  {theme.type as ThemeType === "nlight" && <SunIcon className="w-4 h-4" />}
                </>
              }
              scale={2 / 3}
              px={0.6}
            ></Button>
          </div>
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

export default Footer;
