// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";
import Logo from "@/public/logo.svg";
import Link from "next/link";
// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Logo className="h-5 lg:h-40 text-black dark:text-white " />
    </div>
  );
}
