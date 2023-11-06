import Button from "@/components/elements/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import Input from "@/components/elements/Input";
import InputGroup from "@/components/elements/InputGroup";
import MiniButton from "@/components/elements/MiniButton";
import {
  Modal,
  ModalContents,
  ModalOpenButton,
} from "@/components/elements/Modal";
import { classNames } from "@/shared/helpers/classNamer";
import { Tab } from "@headlessui/react";
import { ChevronDownIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Fragment, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import BoostForm from "../Form/BoostForm";
import UnboostForm from "../Form/UnboostForm";
import useDebounceValue from "@/shared/hooks/useDebounceValue";

export default function BoostSpNftModal() {
  const [openBoost, setOpenBoost] = useState<boolean>(false);
  const [openApr, setOpenApr] = useState<boolean>(false);

  //useForm utils
  const form = useForm();
  const allocateXneutro = useWatch({
    control: form.control,
    name: "allocateXneutro",
  });
  const debouncedAllocateXneutro = useDebounceValue(allocateXneutro, 500);

  return (
    <>
      <Modal>
        <ModalOpenButton>
          <MiniButton type="button">
            <RocketLaunchIcon className="w-7 h-7 mx-auto text-amber-500" />
          </MiniButton>
        </ModalOpenButton>

        <ModalContents>
          {({ close }) => (
            <div className="box-border relative">
              <XCircleIcon
                onClick={() => close()}
                className="h-6 cursor-pointer text-black dark:text-white opacity-50 absolute right-0"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-full text-xl font-bold text-neutral-500 ">
                  Token Name
                </div>
              </div>

              <div className="flex justify-center items-center mt-2 gap-2">
                <span className="text-amber-500 text-xl font-semibold">
                  Boost
                </span>
                <span className="text-xl font-semibold text-black dark:text-white">
                  your position
                </span>
              </div>

              <div className="flex justify-center">
                <div className="text-neutral-500">
                  Allocate xNEUTRO to your spNFT for more yield
                </div>
              </div>

              <Tab.Group>
                <Tab.List className="flex w-full items-center justify-evenly mt-2 mb-4">
                  <Tab className="w-full py-2 bg-neutral-800 text-neutral-600 ui-selected:text-neutral-900 ui-selected:bg-amber-500 hover:text-white rounded-l-lg">
                    Boost
                  </Tab>
                  <Tab className="w-full py-2 bg-neutral-800 text-neutral-600 ui-selected:text-neutral-900 ui-selected:bg-amber-500 hover:text-white rounded-r-lg">
                    Unboost
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <BoostForm />
                  </Tab.Panel>
                  <Tab.Panel>
                    <UnboostForm />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          )}
        </ModalContents>
      </Modal>
    </>
  );
}
