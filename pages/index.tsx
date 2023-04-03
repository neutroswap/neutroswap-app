// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";

// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Text h1>Home Page</Text>
      <Button>Submit</Button>
    </>
  );
}
