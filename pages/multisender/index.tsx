import { Button, Fieldset, Input, Link, Note, Radio, Text, Textarea } from "@geist-ui/core";

export default function Multisender() {
  return (
    <div className="bg-neutral-900 min-h-screen">
      <div className="py-10 bg-black pb-40 border-b-[0.5px] border-white/25">
        <div className="max-w-7xl mx-auto">
          <Text h2 height={3}>Multisend</Text>
          <Text type="secondary" p>Send your token to multiple addresses with different allocations</Text>
        </div>
      </div>
      <div className="space-y-8 max-w-7xl mx-auto">
        <Fieldset className="-translate-y-32">
          <Fieldset.Content className="max-w-[90%] !pb-0">
            <Fieldset.Title>Add your allocation</Fieldset.Title>
            <Fieldset.Subtitle>HTTP is generally designed to be simple and human readable, even with the added complexity introduced in HTTP/2 by encapsulating HTTP messages into frames. HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers.</Fieldset.Subtitle>
          </Fieldset.Content>
          <Fieldset.Content className="max-w-[90%]">
            <Note
              type="warning"
              className="!bg-amber-500/10 !border-[0.5px]"
            >
              Please exclude 0xB803b0E5E7457B135085E896FD7A3398b266cd43 from fees, rewards, max tx amount to start sending tokens.
            </Note>
            <div className="grid grid-cols-10 gap-4 mt-4">
              <div className="col-span-4">
                <Input placeholder="0x000...000" width="100%">
                  Token Address
                </Input>
              </div>
              <div className="col-span-9">
                <div className="flex items-center mb-2">
                  <Text small type="secondary">Allocations</Text>
                </div>
                <Textarea
                  placeholder={`Seperate address and allocation with break line. E.g. address,amount or address amount`}
                  width="100%"
                  className="col-span-1"
                />
              </div>
            </div>
            <div className="flex items-center mt-2 space-x-3">
              <Button scale={1 / 2}>Or choose from CSV file</Button>
              <Link href="#" icon color><Text small>See more example</Text></Link>
            </div>
          </Fieldset.Content>
          <Fieldset.Footer height={1.25}>
            <Text p>Learn more about <Link href="#" icon color>Token Allocations</Link></Text>
            <Button
              auto
              scale={0.75}
              font="12px"
              type="secondary"
              disabled={true}
            >
              Confirm
            </Button>
          </Fieldset.Footer>
        </Fieldset>
      </div>
    </div>
  )
}
