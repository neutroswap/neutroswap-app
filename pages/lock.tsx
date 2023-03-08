import { Button, Collapse, Fieldset, Input, Link, Note, Radio, Text, Toggle } from "@geist-ui/core";
import { useState } from "react";

export default function Mint() {
  const [isReceiverNotOwner, setReceiverNotOwner] = useState(false);
  const [isVesting, setVesting] = useState(false);

  return (
    <div className="bg-neutral-900 min-h-screen">
      <div className="py-10 bg-black pb-40 border-b-[0.5px] border-white/25">
        <div className="max-w-7xl mx-auto">
          <Text h2 height={3}>Lock Token</Text>
          <Text type="secondary" p>Lock your token</Text>
        </div>
      </div>
      <div className="space-y-8 max-w-7xl mx-auto">
        <Fieldset className="-translate-y-32">
          <Fieldset.Content className="max-w-[90%] !pb-0">
            <Fieldset.Title>Token Lock Settings</Fieldset.Title>
            <Fieldset.Subtitle>HTTP is generally designed to be simple and human readable, even with the added complexity introduced in HTTP/2 by encapsulating HTTP messages into frames. HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers.</Fieldset.Subtitle>
          </Fieldset.Content>
          <Fieldset.Content className="max-w-[90%]">
            <Note
              type="warning"
              className="!bg-amber-500/10 !border-[0.5px]"
            >
              Please exclude <b>0xB803b0E5E7457B135085E896FD7A3398b266cd43</b> from fees, rewards, max tx amount to start sending tokens.
            </Note>
            <div className="grid grid-cols-6 gap-4 mt-6">
              <div className="flex space-x-4 col-span-4">
                <Input placeholder="My lock" width="100%">
                  Title
                </Input>
              </div>
              <div className="flex space-x-4 col-span-6">
                <Input placeholder="0x00...000" width="100%">
                  Token Address
                </Input>
                <div className="flex flex-col space-y-2 w-full">
                  <Text small type="secondary">Set owner as receiver</Text>
                  <Toggle
                    scale={2}
                    onChange={(value) => setReceiverNotOwner(value.target.checked)}
                    initialChecked={isReceiverNotOwner}
                  />
                </div>
              </div>
              {isReceiverNotOwner && (
                <div className="flex space-x-4 col-span-4">
                  <Input placeholder="0x00...000" width="100%">
                    Lock Receiver
                  </Input>
                </div>
              )}
              <div className="flex space-x-4 col-span-4">
                <Input placeholder="10000000" width="100%">
                  Amount
                </Input>
                <div className="flex flex-col space-y-2 w-full">
                  <Text small type="secondary">Activate Vesting</Text>
                  <Toggle
                    scale={2}
                    onChange={(value) => setVesting(value.target.checked)}
                    initialChecked={isVesting}
                  />
                </div>
              </div>
              {isVesting && (
                <>
                  <div className="flex space-x-4 col-span-5">
                    <Input placeholder="0x00...000" width="100%">
                      TGE Date
                    </Input>
                  </div>
                  <div className="flex space-x-4 col-span-1">
                    <Input placeholder="0x00...000" width="100%">
                      TGE Percent
                    </Input>
                  </div>
                  <div className="flex space-x-4 col-span-3">
                    <Input placeholder="0x00...000" width="100%">
                      Cycle in Days
                    </Input>
                  </div>
                  <div className="flex space-x-4 col-span-3">
                    <Input placeholder="0x00...000" width="100%">
                      Cycle Release Percent
                    </Input>
                  </div>
                </>
              )}
            </div>

          </Fieldset.Content>
          <Fieldset.Footer height={1.25}>
            <Text p>Learn more about <Link href="#" icon color>Token Type</Link></Text>
            <Button
              auto
              scale={0.75}
              font="12px"
              type="secondary"
              disabled={true}
            >
              Deploy Token
            </Button>
          </Fieldset.Footer>
        </Fieldset>
      </div>
    </div>
  )
}
