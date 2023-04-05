export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          private_key: string
          id: number
          wallet_id: number
          name: string
          index: number
          created_at: string | null
          address: string
          decrypted_private_key: string
        }
        Insert: {
          private_key: string
          id?: number
          wallet_id: number
          name: string
          index: number
          created_at?: string | null
          address: string
        }
        Update: {
          private_key?: string
          id?: number
          wallet_id?: number
          name?: string
          index?: number
          created_at?: string | null
          address?: string
        }
      }
      actions: {
        Row: {
          id: string
          task_id: string
          address: string
          private_key: string
          status: Database["public"]["Enums"]["actions_status"]
          result: string | null
          created_at: string | null
          decrypted_private_key: string
        }
        Insert: {
          id?: string
          task_id: string
          address: string
          private_key: string
          status?: Database["public"]["Enums"]["actions_status"]
          result?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          address?: string
          private_key?: string
          status?: Database["public"]["Enums"]["actions_status"]
          result?: string | null
          created_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          status: Database["public"]["Enums"]["tasks_status"] | null
          contract_address: string
          input_data: string
          trigger_type: Database["public"]["Enums"]["tasks_trigger_type"]
          event: string | null
          block_timestamp: number | null
          value: string | null
          rpc: string
          gas_mode: Database["public"]["Enums"]["tasks_gas_mode"]
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: Database["public"]["Enums"]["tasks_status"] | null
          contract_address: string
          input_data: string
          trigger_type?: Database["public"]["Enums"]["tasks_trigger_type"]
          event?: string | null
          block_timestamp?: number | null
          value?: string | null
          rpc?: string
          gas_mode?: Database["public"]["Enums"]["tasks_gas_mode"]
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["tasks_status"] | null
          contract_address?: string
          input_data?: string
          trigger_type?: Database["public"]["Enums"]["tasks_trigger_type"]
          event?: string | null
          block_timestamp?: number | null
          value?: string | null
          rpc?: string
          gas_mode?: Database["public"]["Enums"]["tasks_gas_mode"]
          created_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          user_id: string
          address: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          created_at?: string | null
        }
      }
      wallets: {
        Row: {
          id: number
          user_id: string
          name: string
          created_at: string | null
          mnemonic: string
          decrypted_mnemonic: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          created_at?: string | null
          mnemonic: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          created_at?: string | null
          mnemonic?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypted_mnemonic: {
        Args: { "": unknown }
        Returns: string
      }
      decrypted_private_key:
        | {
            Args: { "": unknown }
            Returns: string
          }
        | {
            Args: { "": unknown }
            Returns: string
          }
    }
    Enums: {
      actions_status: "idle" | "pending" | "canceled" | "revert" | "success"
      tasks_gas_mode: "market" | "aggresive"
      tasks_status: "queued" | "done"
      tasks_trigger_type: "block_timestamp" | "event"
    }
  }
}

