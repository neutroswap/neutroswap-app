import { ArrowDownIcon } from "@heroicons/react/24/outline";
import React, { FC } from "react";

// import { useSwapActions } from '../trade/TradeProvider'

export const SwitchTokensButton: FC = () => {
  // const { switchTokens } = useSwapActions()
  return (
    <div className="left-0 right-0 -mt-3 -mb-3 flex items-center justify-center">
      <button
        // onClick={switchTokens}
        type="button"
        className="z-10 group bg-gray-100 hover:bg-gray-200 hover:dark:bg-[#2D3036]/50 dark:bg-[#2D3036] p-2 border-white transition-all rounded-md cursor-pointer"
      >
        <div className="transition-transform rotate-0 group-hover:rotate-180">
          <ArrowDownIcon strokeWidth={3} className="w-4 h-4 text-blue" />
        </div>
      </button>
    </div>
  );
};
