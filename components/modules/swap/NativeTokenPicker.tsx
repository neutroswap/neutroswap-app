import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { classNames } from '@/shared/helpers/classNamer'

const tokens = [
  {
    network_id: "15557",
    symbol: "EOS",
    logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg",
    name: "EOS",
    address: "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
    decimal: 18,
  },
  {
    network_id: "15557",
    symbol: "WEOS",
    logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg",
    name: "WEOS",
    address: "0x6ccc5ad199bf1c64b50f6e7dd530d71402402eb6",
    decimal: 18,
  },
]

type NativeTokenPicker = {
  handlePreferNative: Dispatch<SetStateAction<boolean>>;
}

const NativeTokenPicker: React.FC<NativeTokenPicker> = (props) => {
  const { handlePreferNative } = props;
  const [selected, setSelected] = useState(tokens[0])

  useEffect(() => {
    handlePreferNative(selected.symbol === "EOS")
  }, [selected, handlePreferNative])

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1 z-10">
        <Listbox.Button className="relative cursor-default rounded-lg py-2 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300">
          <div className="flex space-x-2 items-center">
            <img
              alt={`${selected.symbol} Icon`}
              src={selected.logo}
              className={classNames(
                "h-6 rounded-full",
                selected.symbol !== "EOS" && "invert"
              )}
            // onError={(e) => {
            //   handleImageFallback(token1.symbol, e);
            // }}
            />
            <p className="m-0 font-bold">{selected.symbol}</p>
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-neutral-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className={classNames(
            "absolute py-1 ml-0 mt-1 w-44 max-h-60 overflow-auto rounded-md text-sm",
            "bg-white dark:bg-[#0C0C0C] shadow-lg dark:shadow-dark-lg",
            "border border-neutral-200 dark:border-neutral-800/50",
            // "ring-1 ring-black ring-opacity-5 focus:outline-none",
          )}
          >
            {tokens.map((person, personIdx) => (
              <Listbox.Option
                key={personIdx}
                className={({ active }) => classNames(
                  "relative cursor-pointer select-none py-2 px-2 mb-0 mx-1 rounded-lg before:hidden transition group",
                  active && "bg-orange-100/50 dark:bg-orange-400/[.08]",
                  !active && "text-gray-900"
                )}
                value={person}
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 items-center">
                      <img
                        alt={`${person.symbol} Icon`}
                        src={person.logo}
                        className={classNames(
                          "h-6 rounded-full",
                          person.symbol !== "EOS" && "invert"
                        )}
                      />
                      <span
                        className={classNames(
                          "block truncate font-medium group-hover:text-orange-900 group-hover:dark:text-orange-300 transition",
                          selected && 'text-orange-900 dark:text-orange-300',
                          !selected && 'text-neutral-500',
                        )}
                      >
                        {person.name}
                      </span>
                    </div>
                    {selected ? (
                      <span className="flex items-center text-amber-600">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox >
  )
}

export default NativeTokenPicker
