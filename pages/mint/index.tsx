import { Button, Fieldset, Input, Link, Radio, Text } from "@geist-ui/core";

export default function Mint() {
  const handler = (val: string | string[]) => console.log(val)
  return (
    <div className="bg-neutral-900 min-h-screen">
      <div className="py-10 bg-black pb-40 border-b-[0.5px] border-white/25">
        <div className="max-w-7xl mx-auto">
          <Text h2 height={3}>Generate your token</Text>
          <Text type="secondary" p>Create a fully-audited ERC20 token and deploy it automatically</Text>
          <Radio.Group value="1" useRow>
            <Radio value="1">
              Standard
              <Radio.Desc>Description for Option1</Radio.Desc>
            </Radio>
            {/* <Radio value="2"> */}
            {/*   Liquidity Generator */}
            {/*   <Radio.Desc>Description for Option2</Radio.Desc> */}
            {/* </Radio> */}
          </Radio.Group>
        </div>
      </div>
      <div className="space-y-8 max-w-7xl mx-auto">
        <Fieldset className="-translate-y-32">
          <Fieldset.Content className="max-w-[90%] !pb-0">
            <Fieldset.Title>General Settings</Fieldset.Title>
            <Fieldset.Subtitle>HTTP is generally designed to be simple and human readable, even with the added complexity introduced in HTTP/2 by encapsulating HTTP messages into frames. HTTP messages can be read and understood by humans, providing easier testing for developers, and reduced complexity for newcomers.</Fieldset.Subtitle>
          </Fieldset.Content>
          <Fieldset.Content className="max-w-[90%]">
            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-4">
                <Input placeholder="Your token name" width="100%">
                  Token Name
                </Input>
              </div>
              <div className="col-span-1">
                <Input placeholder="ETH" width="100%" className="col-span-1">
                  Token Symbol
                </Input>
              </div>
              <div className="col-span-1">
                <Input placeholder="e.g 18" width="100%" className="col-span-1">
                  Token Decimal
                </Input>
              </div>
              <div className="col-span-3">
                <Input placeholder="21000000" width="100%" className="col-span-1">
                  Token Supply
                </Input>
              </div>
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
