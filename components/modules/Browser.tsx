import { Card, Divider, useTheme } from "@geist-ui/core"
import { LockClosedIcon } from "@heroicons/react/24/solid";

const Browser: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  return (
    <Card className="!rounded-lg">
      <Card.Content className="!px-1 !py-0">
        <div className="flex justify-between items-center py-2">
          <div className="flex space-x-2 px-2">
            <div className="w-3 h-3 rounded-[50%] bg-red-500" />
            <div className="w-3 h-3 rounded-[50%] bg-yellow-500" />
            <div className="w-3 h-3 rounded-[50%] bg-green-500" />
          </div>
          <div
            className="relative flex items-center w-full max-w-lg rounded-md py-1.5 px-3"
            style={{
              background: theme.palette.accents_2,
              border: theme.palette.border,
            }}
          >
            <LockClosedIcon className="w-4 h-4 text-green-500" />
            <input
              className="text-sm w-full text-center text-green-500 bg-transparent"
              value={`https://www.protostar.finance/`}
            />
          </div>
          <div className="w-10" />
        </div>
      </Card.Content>
      <Divider h="1px" my={0} />
      <Card.Content className="!p-8">
        {children}
      </Card.Content>
    </Card>
  )
}
export default Browser;
