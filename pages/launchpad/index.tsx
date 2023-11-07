// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import { allContents } from 'contentlayer/generated'

// const inter = Inter({ subsets: ['latin'] })

export default function Launchpad() {
  console.log("all contents ", allContents);
  return (
    <div className="flex flex-col h-[80vh] justify-center items-center">
      <Text h1>
        Coming Soon
      </Text>
    </div>
  );
}
