import { Button, Drawer, Input, Loading, Table, Tabs, Text, useTheme } from "@geist-ui/core";
import { TableColumnRender } from "@geist-ui/core/dist/table";
import { useRef, useState } from "react";
import { ArrowLeftIcon, LockClosedIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useRouter } from "next/router";
import Browser from "@/components/modules/Browser";
import CreatePoolDrawer from "@/components/templates/Drawer/CreatePoolDrawer";
// import RichText from "@/components/modules/RichText";
import dynamic from "next/dynamic";
import { GlobeAltIcon, PencilIcon, PhotoIcon } from "@heroicons/react/24/outline";
import DiscordIcon from '@/public/icons/discord.svg'
import InstagramIcon from '@/public/icons/instagram.svg'
import TwitterIcon from '@/public/icons/twitter.svg'
import YoutubeIcon from '@/public/icons/youtube.svg'
import { currencyFormat } from "@/shared/helpers/currencyFormat";
import ImageUpload from "@/components/elements/ImageUpload";
import { FilePond } from "filepond";
import { renderToString } from "react-dom/server";
// import { DonutChart } from "@tremor/react";

const DonutChart = dynamic(() =>
  import("@tremor/react").then((mod) => mod.DonutChart),
  { loading: () => <Loading className="!my-8" spaceRatio={2.5} /> }
);

const RichText = dynamic(() => import("@/components/modules/RichText"), {
  ssr: false
});

type TokenDetails = {
  key: string,
  value: string
}

type TokenDistributions = {
  key: string,
  value: number
}

export default function Lock() {
  let pond = useRef<FilePond>(null);

  const router = useRouter();
  const theme = useTheme()


  const [image, setImage] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false)
  const [tokenDistributionsData, setTokenDistributionsData] = useState<TokenDistributions[]>([
    { key: 'Public Sale', value: 0 },
    { key: 'Liquidity', value: 0 },
    { key: 'Team', value: 0 },
    { key: 'Reserve', value: 0 },
    { key: 'Partners & Advisors', value: 0 },
    { key: 'Marketing', value: 0 },
  ])
  const [tokenDetailsData, setTokenDetailsData] = useState<TokenDetails[]>([
    { key: 'Circulating Supply', value: 'TBA' },
    { key: 'Total Supply', value: 'TBA' },
    { key: 'Initial Market Cap', value: 'TBA' },
  ])

  const handler = () => setModalOpen(true)
  const closeHandler = () => {
    setModalOpen(false)
  }

  const useTokenDetailsRowUpdate: TableColumnRender<TokenDetails> = (value, rowData, rowIndex) => {
    const [localState, setLocalState] = useState("TBA");
    const [isEdit, setIsEdit] = useState(false);
    const handleUpdate = (value: string) => {
      setTokenDetailsData((prev) => {
        return prev.map((item, stateIndex) => {
          if (stateIndex !== rowIndex) return item;
          return { ...item, value: value };
        })
      })
    }

    if (isEdit) {
      return (
        <div className="flex space-x-2">
          <Input
            htmlType="number"
            placeholder={`21,000,000`}
            initialValue={rowData.value === "TBA" ? "" : rowData.value}
            scale={2 / 3}
            onChange={(e) => { setLocalState(e.target.value) }}
          />
          <Button
            auto paddingLeft="0.5rem" paddingRight="0.5rem" scale={2 / 3}
            onClick={() => {
              handleUpdate(localState);
              setIsEdit(false);
            }}
          >Save</Button>
        </div>
      )
    }
    return (
      <div className="flex space-x-2 items-center">
        {rowData.value !== "TBA" && <span>{currencyFormat(+rowData.value)}</span>}
        {rowData.value === "TBA" && <span>{rowData.value}</span>}
        <Button
          auto paddingLeft="0.5rem" paddingRight="0.5rem" scale={1 / 3}
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => setIsEdit(true)}
        />
      </div>
    )
  }
  const useTokenDistributionsRowUpdate: TableColumnRender<TokenDetails> = (value, rowData, rowIndex) => {
    const [localState, setLocalState] = useState(0);
    const [isEdit, setIsEdit] = useState(false);
    const handleUpdate = (value: number) => {
      setTokenDistributionsData((prev) => {
        return prev.map((item, stateIndex) => {
          if (stateIndex !== rowIndex) return item;
          return { ...item, value: value };
        })
      })
    }

    if (isEdit) {
      return (
        <div className="flex space-x-2">
          <Input
            htmlType="number"
            placeholder={`21,000,000`}
            initialValue={rowData.value === "TBA" ? "" : rowData.value}
            scale={2 / 3}
            onChange={(e) => { setLocalState(+e.target.value) }}
          />
          <Button
            auto paddingLeft="0.5rem" paddingRight="0.5rem" scale={2 / 3}
            onClick={() => {
              handleUpdate(localState);
              setIsEdit(false);
            }}
          >Save</Button>
        </div>
      )
    }
    return (
      <div className="flex space-x-2 items-center">
        {rowData.value !== "TBA" && <span>{currencyFormat(+rowData.value)}</span>}
        {rowData.value === "TBA" && <span>{rowData.value}</span>}
        <Button
          auto paddingLeft="0.5rem" paddingRight="0.5rem" scale={1 / 3}
          icon={<PencilIcon className="w-4 h-4" />}
          onClick={() => setIsEdit(true)}
        />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: theme.palette.accents_1 }}
    >
      <div
        className="pt-10 pb-14 border-b-[0.5px]"
        style={{
          background: theme.palette.background,
          borderColor: theme.palette.border
        }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            className="flex items-center space-x-2 mb-4"
            style={{ color: theme.palette.secondary }}
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Text h2 height={3}>List Token</Text>
          <Text type="secondary" p>List your token on Protostar launchpad</Text>
        </div>
      </div>
      <div className="space-y-8 max-w-7xl mx-auto -translate-y-10">
        <Browser>
          <div className="flex items-center space-x-6">
            <div className="relative w-28 h-28">
              <ImageUpload
                ref={pond}
                name="cover-upload"
                bucket={""}
                setPublicUrl={setImage}
                stylePanelLayout="compact"
                styleLoadIndicatorPosition="center bottom"
                styleProgressIndicatorPosition="right bottom"
                styleButtonRemoveItemPosition="left bottom"
                styleButtonProcessItemPosition="right bottom"
                labelIdle={(() => {
                  return renderToString(
                    <div className="mt-2 text-neutral-400">
                      <svg
                        className="w-10 h-10 mx-auto text-neutral-500 hover:cursor-pointer"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1 w-[80%] !text-xs mx-auto">Upload your logo here</p>
                    </div>
                  );
                })()}
              // setTouched={setTouched}
              />
            </div>
            <div className="flex flex-col">
              <input
                className="bg-transparent text-4xl font-semibold"
                placeholder={`Your Project Name`}
                defaultValue={`Your Project Name`}
              />
              <input
                className="bg-transparent"
                style={{ color: theme.palette.secondary }}
                placeholder={`Project tagline goes here`}
                defaultValue={`Your project tagline here`}
              />
              <input
                className="bg-transparent mt-1"
                style={{ color: theme.palette.secondary }}
                defaultValue={`Category`}
              />
            </div>
          </div>
          <div className="relative w-full h-80 mt-8">
            <ImageUpload
              ref={pond}
              name="cover-upload"
              bucket={""}
              setPublicUrl={setImage}
              imagePreviewMaxHeight={285}
              labelIdle={(() => {
                return renderToString(
                  <div className="text-sm text-neutral-400">
                    <div className="space-y-1 text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-neutral-500"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="font-medium text-primary-600 hover:underline hover:cursor-pointer">
                      Drag and drop
                    </span>
                    <span className="pl-1">or click to upload a banner</span>
                    <p className="mt-1 !text-xs">PNG, JPG, or GIF up to 10MB</p>
                  </div>
                );
              })()}
            // setTouched={setTouched}
            />
          </div>
          <p className="text-xs">* We recommend images that are at least 1600px wide and 400px tall</p>
          <div className="grid grid-cols-1 md:grid-cols-10 gap-8 mt-10">
            <div className="flex flex-col min-h-min col-span-6">
              <RichText
                value={`
                  <h1>Your Project Name</h1>
                  <p>[Describe some brief introduction here]</p>
                  <h2>Highlights</h1>
                  <ul>
                    <li>Describe what your projects are doing</li>
                    <li>Using lists of points</li>
                    <li>So investors can grasp your product better</li>
                    <li>And understand fully what you're doing</li>
                  </ul>
                  <h2>Problem</h2>
                  <h1>Monsters are Incredibly Good at Writing</h1>
                  <p>[Describe problems that you are going to solve]</p>
                  <h2>Solution</h2>
                  <h1>Introducing Superhuman Serum to Fight Monsters</h1>
                  <p>[Describe your solution based on the problem you mentioned above]</p>
                  <h1>No Maximum Serum Dose, Buffed Humans could be the Next Thing</h1>
                  <p>[No one prevent you to use multiple headings inside a section]</p>
                  <h2>Our Team</h2>
                  <ul>
                    <li><b>Mujihiro Sakamoto</b>: Chief lorem ipsum product, working on multiple lorem and fight monsters at night</li>
                    <li><b>Satoshi Nakalorem</b>: Chief lorem ipsum product, working on multiple lorem and fight monsters at night</li>
                    <li><b>Ipsuma Loriam</b>: Chief lorem ipsum product, working on multiple lorem and fight monsters at night</li>
                    <li><b>Genji</b>: Chief lorem ipsum product, working on multiple lorem and fight monsters at night</li>
                  </ul>
                `}
              />

              <div className="px-4 my-10">
                <Tabs initialValue="1">
                  <Tabs.Item label="Token Details" value="1">
                    <Table data={tokenDetailsData} className="!mt-4 two-column-table">
                      <Table.Column prop="key" label="Property" />
                      <Table.Column prop="value" label="Value" render={useTokenDetailsRowUpdate} />
                    </Table>
                  </Tabs.Item>
                  <Tabs.Item label="Token Distribution" value="2">
                    <div>
                      {tokenDistributionsData.reduce((acc, currentValue) => acc + currentValue.value, 0) !== 0 && (
                        <DonutChart
                          data={tokenDistributionsData}
                          category="value"
                          index="key"
                          valueFormatter={currencyFormat}
                          className="h-60 mt-6"
                        // colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
                        />
                      )}
                    </div>
                    <Table data={tokenDistributionsData} className="!mt-8 two-column-table">
                      <Table.Column prop="key" label="Property" />
                      <Table.Column prop="value" label="Value" render={useTokenDistributionsRowUpdate} />
                    </Table>
                  </Tabs.Item>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 px-4 divide-y divide-neutral-200/50 dark:divide-neutral-900">
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-600">
                    <TwitterIcon className="h-4" /><p>Twitter</p>
                  </span>
                  <Button auto icon={<PlusIcon className="h-4" />} scale={2 / 3}>Add</Button>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-600">
                    <DiscordIcon className="h-4" /><p>Discord</p>
                  </span>
                  <Button auto icon={<PlusIcon className="h-4" />} scale={2 / 3}>Add</Button>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-600">
                    <InstagramIcon className="h-4" /><p>Instagram</p>
                  </span>
                  <Button auto icon={<PlusIcon className="h-4" />} scale={2 / 3}>Add</Button>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-600">
                    <YoutubeIcon className="h-4" /><p>Youtube</p>
                  </span>
                  <Button auto icon={<PlusIcon className="h-4" />} scale={2 / 3}>Add</Button>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center space-x-2 text-neutral-500 dark:text-neutral-600">
                    <GlobeAltIcon className="h-4" /><p>Website</p>
                  </span>
                  <Button auto icon={<PlusIcon className="h-4" />} scale={2 / 3}>Add</Button>
                </div>
              </div>

            </div>
            <div
              className="sticky inline h-fit top-20 col-span-4"
            >
              <div className="text-center p-10 border border-neutral-200 shadow-lg shadow-neutral-100 dark:shadow-neutral-900 dark:border-neutral-800 rounded-lg dark:bg-neutral-900">
                <div>
                  <p className="text-xl font-semibold mb-0">No Pool Found</p>
                  <p className="mt-1" style={{ color: theme.palette.secondary }}>
                    Deploy a new pool contract to start, all gas fees will be charged to the deployer
                  </p>
                  <Button onClick={handler}>Add pool contract</Button>
                </div>
              </div>
            </div>
          </div>
        </Browser>
      </div >
      <Drawer visible={isModalOpen} onClose={closeHandler} placement="bottom" padding={0} style={{ background: theme.palette.accents_1 }}>
        <CreatePoolDrawer close={() => setModalOpen(false)} />
      </Drawer>
    </div >
  )
}
