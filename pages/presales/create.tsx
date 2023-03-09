import { Button, Card, Divider, Dot, Drawer, Fieldset, Input, Link, Modal, Note, Select, Spacer, Text, Textarea, Toggle, useTheme } from "@geist-ui/core";
import { useState } from "react";
import { ArrowLeftIcon, LockClosedIcon, PlusIcon } from '@heroicons/react/24/solid'
import { useRouter } from "next/router";
import Browser from "@/components/modules/Browser";
import CreatePoolDrawer from "@/components/templates/Drawer/CreatePoolDrawer";
// import RichText from "@/components/modules/RichText";
import dynamic from "next/dynamic";

const RichText = dynamic(() => import("@/components/modules/RichText"), {
  ssr: false
});

export default function Lock() {
  const router = useRouter();
  const theme = useTheme()

  const [isReceiverNotOwner, setReceiverNotOwner] = useState(false);
  const [isVesting, setVesting] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false)
  const handler = () => setModalOpen(true)
  const closeHandler = () => {
    setModalOpen(false)
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
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center justify-center p-8 border rounded-lg border-dashed"
              style={{ borderColor: theme.palette.accents_3 }}
            >
              <PlusIcon
                className="w-8 h-8"
                style={{ color: theme.palette.accents_3 }}
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
          <div className="flex items-center space-x-4 mt-8">
            <div
              className="flex items-center justify-center p-8 h-80 w-full border rounded-lg border-dashed"
              style={{ borderColor: theme.palette.accents_3 }}
            >
              <PlusIcon
                className="w-8 h-8"
                style={{ color: theme.palette.accents_3 }}
              />
            </div>
          </div>
          <div className="flex space-x-8 mt-10">
            {/* <div */}
            {/*   className="flex items-center justify-center p-8 w-7/12 h-[1090px] border rounded-lg border-dashed" */}
            {/*   style={{ borderColor: theme.palette.accents_3 }} */}
            {/* > */}
            {/*   <PlusIcon */}
            {/*     className="w-8 h-8" */}
            {/*     style={{ color: theme.palette.accents_3 }} */}
            {/*   /> */}
            {/* </div> */}

            <div className="flex items-center justify-center w-7/12 min-h-min">
              <RichText value={`
                  <h1>Your Project Name</h1>
                  <p>[Fill in your projects description here]</p>
                  <h2>Introduction</h2>
                  <p>[Fill in your projects introduction here]</p>
                  <h2>Problem</h2>
                  <p>[Describe problems that you are going to solve]</p>
                  <h2>Solution</h2>
                  <p>[Describe your solution based on the problem you mentioned above]</p>
                `}
              />
            </div>
            <div
              className="w-5/12 sticky top-0"
            >
              <Card className="text-center" py={1}>
                <div>
                  <p className="text-xl font-semibold mb-0">No Pool Found</p>
                  <p className="mt-1" style={{ color: theme.palette.secondary }}>
                    Deploy a pool contract to start, all gas fees will be charged to the deployer
                  </p>
                  <Button onClick={handler}>Add pool contract</Button>
                </div>
              </Card>
            </div>
          </div>
        </Browser>
      </div>
      <Drawer visible={isModalOpen} onClose={closeHandler} placement="bottom" padding={0} style={{ background: theme.palette.accents_1 }}>
        <CreatePoolDrawer close={() => setModalOpen(false)} />
      </Drawer>
    </div>
  )
}
