// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";

// const inter = Inter({ subsets: ['latin'] })

export default function Launchpad() {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <Text h1 className="text-white">
        Coming Soon
      </Text>
    </div>
  );
}