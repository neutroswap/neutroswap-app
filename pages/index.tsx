// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Page, Text } from "@geist-ui/core";

// const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <div className="max-w-7xl mx-auto py-10">
        <Text h1>Home Page</Text>
        <Button>Submit</Button>
      </div>
    </>
  )
}
