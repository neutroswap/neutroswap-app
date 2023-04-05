if (!process.env.NEXT_PUBLIC_ROUTER_CONTRACT) throw new Error("Missing env.NEXT_PUBLIC_ROUTER_CONTRACT");
export const ROUTER_CONTRACT = process.env.NEXT_PUBLIC_ROUTER_CONTRACT as `0x${string}`

if (!process.env.NEXT_PUBLIC_FACTORY_CONTRACT) throw new Error("Missing env.NEXT_PUBLIC_FACTORY_CONTRACT");
export const FACTORY_CONTRACT = process.env.NEXT_PUBLIC_FACTORY_CONTRACT as `0x${string}`
