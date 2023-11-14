if (!process.env.NEXT_PUBLIC_ROUTER_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_ROUTER_CONTRACT");
export const ROUTER_CONTRACT = process.env
  .NEXT_PUBLIC_ROUTER_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_FACTORY_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_FACTORY_CONTRACT");
export const FACTORY_CONTRACT = process.env
  .NEXT_PUBLIC_FACTORY_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_MULTICALL_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_MULTICALL_CONTRACT");
export const MULTICALL_CONTRACT = process.env
  .NEXT_PUBLIC_MULTICALL_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT");
export const XNEUTRO_CONTRACT = process.env
  .NEXT_PUBLIC_XNEUTRO_TOKEN_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_YIELDBOOSTER_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_YIELDBOOSTER_CONTRACT");
export const YIELDBOOSTER_CONTRACT = process.env
  .NEXT_PUBLIC_YIELDBOOSTER_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_DIVIDENDS_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_DIVIDENDS_CONTRACT");
export const DIVIDENDS_CONTRACT = process.env
  .NEXT_PUBLIC_DIVIDENDS_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT");
export const NEUTRO_CONTRACT = process.env
  .NEXT_PUBLIC_NEUTRO_TOKEN_CONTRACT as `0x${string}`;

if (!process.env.NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT)
  throw new Error("Missing env.NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT");
export const NEUTRO_HELPER_CONTRACT = process.env
  .NEXT_PUBLIC_NEUTRO_HELPER_CONTRACT as `0x${string}`;
