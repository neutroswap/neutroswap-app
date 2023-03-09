import { Button, Divider, Drawer, Input, Select, useTheme } from "@geist-ui/core"

interface Props {
  close: () => void
}

const CreatePoolDrawer: React.FC<Props> = ({ close }) => {
  const theme = useTheme();
  return (
    <>
      <Drawer.Content>
        <div>
          <p className="text-2xl font-semibold mb-0">Create a New Pool</p>
          <p className="mt-1" style={{ color: theme.palette.secondary }}>Deploy pool contract</p>
        </div>

      </Drawer.Content>
      <Divider h="1px" my={0} />
      <Drawer.Content margin={0} paddingTop={0} paddingBottom={0}>
        <div>
          <p className="text-lg md:text-xl font-semibold mb-0">Pool Overview</p>
          <p className="mt-1 hidden md:block" style={{ color: theme.palette.secondary }}>General pool settings like name, start sale date and end sale date. This configuration can be changed but may required gas fee for future updates</p>
        </div>
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-8 gap-6 !my-8">
          <div className="w-full col-span-5">
            <Input label="Name" w="100%" scale={1.1} />
          </div>
          <div className="w-full col-span-3">
            <Input label="Owner" w="100%" scale={1.1} />
          </div>
          <div className="w-full col-span-4">
            <Input label="Sale Start" w="100%" scale={1.1} />
          </div>
          <div className="w-full col-span-4">
            <Input label="Sale End" w="100%" scale={1.1} />
          </div>
        </div>
      </Drawer.Content>
      <Divider h="1px" my={0} />
      <Drawer.Content margin={0} paddingTop={0} paddingBottom={0}>
        <div>
          <p className="text-lg md:text-xl font-semibold mb-0">Fund Raising Settings</p>
          <p className="mt-1 hidden md:block" style={{ color: theme.palette.secondary }}>General pool settings like name, start sale date and end sale date. This configuration can be changed but may required gas fee for future updates</p>
        </div>
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-8 gap-6 my-8">
          <div className="w-full col-span-3">
            <Input label="Max Capital" w="100%" scale={1.1} />
          </div>
          <div className="w-full col-span-5">
            <Select placeholder="Choose Base Token" scale={1.1}>
              <Select.Option value="weth">WETH</Select.Option>
              <Select.Option value="usdt">USDT</Select.Option>
              <Select.Option value="usdc">USDC</Select.Option>
            </Select>
          </div>
          <div className="w-full col-span-4">
            <Input label="Min. Allocation" w="100%" scale={1.1} />
          </div>
          <div className="w-full col-span-4">
            <Input label="Max. Allocation" w="100%" scale={1.1} />
          </div>
        </div>
      </Drawer.Content>
      <Divider h="1px" mt={5} paddingBottom={0} />
      <div
        className="w-full flex justify-end px-4 pb-4"
      >
        <div className="flex">
          <Button onClick={close} type="abort">Cancel</Button>
          <Button type="secondary">Deploy Pool</Button>
        </div>
      </div>
    </>
  )
}

export default CreatePoolDrawer;
