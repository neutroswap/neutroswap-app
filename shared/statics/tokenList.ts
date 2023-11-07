import { SupportedChainID } from "../types/chain.types";
import { Token } from "../types/tokens.types";

/**
 * index0: Native token (with wrapped token address)
 * index1: Default token0
 * index2: Default token1
 */
export const tokens: Record<SupportedChainID, Array<Token>> = {
  // NOTE: EOS Mainnet
  "17777": [
    {
      // network_id: "17777",
      symbol: "EOS",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg",
      name: "EOS",
      address: "0xc00592aA41D32D137dC480d9f6d0Df19b860104F",
      decimal: 18,
    },
    {
      // network_id: "17777",
      symbol: "USDT",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/usdt.svg",
      name: "USD Tether",
      address: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
      decimal: 6,
    },
    {
      // network_id: "17777",
      symbol: "USDC",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/usdc.svg",
      name: "USD Circle",
      address: "0x765277EebeCA2e31912C9946eAe1021199B39C61",
      decimal: 6,
    },
    {
      // network_id: "17777",
      symbol: "WETH",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/weth.svg",
      name: "Wrapped ETH",
      address: "0x922D641a426DcFFaeF11680e5358F34d97d112E1",
      decimal: 18,
    },
    {
      // network_id: "17777",
      symbol: "WBTC",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/wbtc.svg",
      name: "Wrapped BTC",
      address: "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73",
      decimal: 18,
    },
    {
      // network_id: "17777",
      symbol: "NEUTRO",
      logo: "/logo/neutro_token.svg",
      name: "Neutroswap Token",
      address: "0xF4bd487A8190211E62925435963D996b59a860C0",
      decimal: 18,
    },
  ],
  // NOTE: EOS Testnet
  "15557": [
    {
      // network_id: "15557",
      symbol: "EOS",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/eos.svg",
      name: "EOS",
      address: "0x6cCC5AD199bF1C64b50f6E7DD530d71402402EB6",
      decimal: 18,
    },
    {
      // network_id: "15557",
      symbol: "USDC",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/usdc.svg",
      name: "USD Circle",
      address: "0x4ceaC0A4104D29f9d5f97F34B1060A98A5eAf21d",
      decimal: 6,
    },
    {
      // network_id: "15557",
      symbol: "NEUTRO",
      logo: "/logo/neutro_token.svg",
      name: "Neutroswap Token",
      address: "0x4D0BfAF503fE1e229b1B4F8E4FC1952803ec843f",
      decimal: 18,
    },
    {
      // network_id: "15557",
      symbol: "USDT",
      logo: "https://raw.githubusercontent.com/shed3/react-crypto-icons/main/src/assets/usdt.svg",
      name: "USD Tether",
      address: "0xd61551b3E56343B6D9323444cf398f2fdf23732b",
      decimal: 6,
    },
  ],
};
