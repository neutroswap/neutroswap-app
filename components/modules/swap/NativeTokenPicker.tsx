import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { classNames } from '@/shared/helpers/classNamer'
import { useNetwork } from 'wagmi'
import { DEFAULT_CHAIN_ID, SupportedChainID, supportedChainID } from '@/shared/types/chain.types'
import { tokens } from '@/shared/statics/tokenList'
import { Token } from '@/shared/types/tokens.types'

type NativeTokenPicker = {
  handlePreferNative: Dispatch<SetStateAction<boolean>>;
}

const NativeTokenPicker: React.FC<NativeTokenPicker> = (props) => {
  const { handlePreferNative } = props;
  const { chain } = useNetwork()

  // TODO: MOVE THIS HOOKS
  const chainSpecificTokens = useMemo(() => {
    if (!chain) return tokens[DEFAULT_CHAIN_ID];
    if (!supportedChainID.includes(chain.id.toString() as any)) return tokens[DEFAULT_CHAIN_ID];
    return tokens[chain.id.toString() as SupportedChainID]
  }, [chain]);

  const wrappedAndNativeToken: [Token, Token] = useMemo(() => {
    return [
      chainSpecificTokens[0],
      {
        ...chainSpecificTokens[0],
        name: "W" + chainSpecificTokens[0].name
      }
    ]
  }, [chainSpecificTokens])

  const [selected, setSelected] = useState(wrappedAndNativeToken[0])

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
            {wrappedAndNativeToken.map((token, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) => classNames(
                  "relative cursor-pointer select-none py-2 px-2 mb-0 mx-1 rounded-lg before:hidden transition group",
                  active && "bg-orange-100/50 dark:bg-orange-400/[.08]",
                  !active && "text-gray-900"
                )}
                value={token}
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 items-center">
                      <img
                        alt={`${token.symbol} Icon`}
                        src={token.logo}
                        className={classNames(
                          "h-6 rounded-full",
                          token.symbol !== "EOS" && "invert"
                        )}
                      />
                      <span
                        className={classNames(
                          "block truncate font-medium group-hover:text-orange-900 group-hover:dark:text-orange-300 transition",
                          selected && 'text-orange-900 dark:text-orange-300',
                          !selected && 'text-neutral-500',
                        )}
                      >
                        {token.name}
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
