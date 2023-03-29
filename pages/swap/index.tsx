// import { Inter } from 'next/font/google'

import Navbar from "@/components/modules/Navbar";
import { Button, Card, Divider, Page, Select, Text } from "@geist-ui/core";
import { LockClosedIcon } from "@heroicons/react/24/solid";

// const inter = Inter({ subsets: ['latin'] })

export default function Swap() {
  const handler = (val: any) => console.log(val)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[80%] py-10">
        <div className="">
          <Text h2 height={3} className="text-center">Swap</Text>
          <Text type="secondary" p className="text-center !mt-0">Trade your token</Text>
        </div>
        <div className="mt-8 rounded-lg border border-neutral-800/50 shadow-dark-lg p-4 space-y-2">
          <div className="p-4 bg-black/50 rounded-lg">
            <p className="text-sm text-neutral-400">You Sell</p>
            <div className="flex justify-between">
              <input className="text-2xl bg-transparent focus:outline-none" value={10} />
              <Select placeholder="Choose one" onChange={handler} initialValue="1">
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
              </Select>
            </div>
          </div>
          <div className="p-4 bg-black/50 rounded-lg">
            <p className="text-sm text-neutral-400">You Sell</p>
            <div className="flex justify-between">
              <input className="text-2xl bg-transparent focus:outline-none" value={10} />
              <Select placeholder="Choose one" onChange={handler} initialValue="1">
                <Select.Option value="1">Option 1</Select.Option>
                <Select.Option value="2">Option 2</Select.Option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
