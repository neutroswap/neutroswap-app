import { XCircleIcon } from "@heroicons/react/24/solid";
import Button from "components/elements/Button";
import { SubmitHandler, useForm } from "react-hook-form";
import { classNames } from "shared/helpers/classNames";
import { Accounts, db } from "shared/helpers/db";
import { useWalletWorker } from "shared/hooks/useWalletWorker";
import { WalletsAccountsJoin } from "shared/stores/wallets";

export interface IAddMoreAccountForm {
  amount: number;
}

interface Props {
  selectedGroup: WalletsAccountsJoin;
  handleClose: () => void;
}

const AddMoreAccountsForm: React.FC<Props> = ({
  handleClose,
  selectedGroup,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<IAddMoreAccountForm>();

  const { percentage, generate, isLoading } = useWalletWorker({
    closeModalHandler: handleClose,
  });

  const onSubmit: SubmitHandler<IAddMoreAccountForm> = (data) => {
    if (selectedGroup) {
      let accounts = (selectedGroup.accounts as Accounts[]).sort(
        (a, b) => a.index - b.index
      );
      const lastIndex = accounts[accounts.length - 1].index;
      // console.log(accounts);
      // console.log("lastIndex", lastIndex);
      generate({
        ...selectedGroup,
        mnemonic:
          (selectedGroup as any).decrypted_mnemonic ?? selectedGroup.mnemonic,
        wallets: accounts,
        amount: data.amount,
        lastIndex: lastIndex,
      });
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold">Add More Accounts</h2>
          <p className="pt-0.5 text-sm text-cool-gray-400">
            Configure your account
          </p>
        </div>
        <button type="button" onClick={handleClose}>
          <XCircleIcon className="h-6 w-6 text-cool-gray-500 hover:text-cool-gray-400" />
        </button>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-cool-gray-400">
          Use Number Preset
        </label>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            className={classNames(
              "flex-1 items-center gap-2 rounded-md border border-dark-gray-400 px-3 py-2",
              "hover:border-dark-gray-300",
              "focus:outline-none focus:ring-1 focus:ring-blue-600"
            )}
            onClick={() => setValue("amount", 10)}
          >
            10 Account
          </button>
          <button
            type="button"
            className={classNames(
              "flex-1 items-center gap-2 rounded-md border border-dark-gray-400 px-3 py-2",
              "hover:border-dark-gray-300",
              "focus:outline-none focus:ring-1 focus:ring-blue-600"
            )}
            onClick={() => setValue("amount", 30)}
          >
            30 Account
          </button>
          <button
            type="button"
            className={classNames(
              "flex-1 items-center gap-2 rounded-md border border-dark-gray-400 px-3 py-2",
              "hover:border-dark-gray-300",
              "focus:outline-none focus:ring-1 focus:ring-blue-600"
            )}
            onClick={() => setValue("amount", 50)}
          >
            50 Account
          </button>
          <button
            type="button"
            className={classNames(
              "flex-1 items-center gap-2 rounded-md border border-dark-gray-400 px-3 py-2",
              "hover:border-dark-gray-300",
              "focus:outline-none focus:ring-1 focus:ring-blue-600"
            )}
            onClick={() => setValue("amount", 100)}
          >
            100 Account
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-cool-gray-800" />
        <span className="text-sm uppercase text-cool-gray-500">or</span>
        <hr className="flex-1 border-cool-gray-800" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-cool-gray-400">
          Number of accounts
          <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          className={classNames(
            "mt-1 w-full rounded-lg border-none bg-dark-gray-500 p-3 focus:outline-none focus:ring-0",
            errors.amount && "ring-1 ring-red-500"
          )}
          {...register("amount", { required: true, min: 1, max: 100 })}
        />
        {errors.amount && (
          <span className="text-red-400 text-xs">
            Public beta only support 100 wallet in a group
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-lg border border-cool-gray-600 py-3 text-sm text-cool-gray-400"
        >
          Cancel
        </button>
        <Button
          type="submit"
          loading={isLoading}
          loadingText={`Generating ${percentage}%`}
        >
          Add New Account(s)
        </Button>
      </div>
    </form>
  );
};

export default AddMoreAccountsForm;
