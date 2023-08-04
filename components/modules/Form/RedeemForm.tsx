"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/elements/Form";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import InputGroup from "@/components/elements/InputGroup";
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";

export default function RedeemForm() {
  const form = useForm();
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(15);
  const [error, setError] = useState(false);

  const handleDecrement = () => {
    if (months === 0 && days === 0) {
      // Don't decrement further as it will go below 15 days
      setError(true); // Show the error message
      return;
    }

    if (days === 0) {
      setMonths((prevMonths) => prevMonths - 1);
      setDays(29);
    } else {
      setDays((prevDays) => prevDays - 1);
    }

    setError(false); // Reset the error state on decrement
  };

  const handleIncrement = () => {
    if (months < 6 || (months === 6 && days < 30)) {
      if (days === 29) {
        setDays(0);
        setMonths((prevMonths) => prevMonths + 1);
      } else {
        setDays((prevDays) => prevDays + 1);
      }
    }

    if (months > 6 || (months === 6 && days >= 30)) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSetMax = () => {
    setMonths(6);
    setDays(0);
    setError(false);
  };

  useEffect(() => {
    if (months === 6 && days > 0) {
      setError(true);
    } else if (months === 0 && days < 15) {
      setError(true);
    } else {
      setError(false);
    }
  }, [months, days]);

  return (
    <Form {...form}>
      {/* <form> */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold">Redeem xGRAIL</div>
          <p className="text-sm font-normal leading-5 text-gray-500">
            Redeem your xGRAIL back into GRAIL over a vesting period of 15 days
            (1 → 0.5 ratio) to 6 months (1 → 1 ratio).
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <FormField
            control={form.control}
            name="redeemXgrailToGrail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputGroup
                    suffix={
                      <button
                        type="button"
                        className="mr-1.5 mt-2 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase leading-5 text-neutral-600"
                        //   onClick={() =>
                        //     form.setValue("redeemXgfcToGfc", availableXgfc)
                        //   }
                      >
                        Max
                      </button>
                    }
                  >
                    <Input
                      type="number"
                      className="mt-2"
                      placeholder="0.00"
                      {...field}
                    ></Input>
                  </InputGroup>
                </FormControl>
              </FormItem>
            )}
          ></FormField>
        </div>
        <div className="flex justify-end text-xs text-neutral-500 -mt-2">
          <div>
            <span className="mr-2">wallet balance:</span>
            <span>0 GRAIL</span>
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex flex-col mt-3">
            <div className="font-xs font-semibold">Redeem duration</div>
            <a
              className="text-xs text-amber-500 items-start"
              onClick={handleSetMax}
            >
              Set max
            </a>
          </div>
          <div className="flex flex-row items-center space-x-4">
            <button
              className="border w-8 h-8 font-semibold"
              onClick={handleDecrement}
            >
              -
            </button>
            <div className="text-xs text-neutral-500 mb-0">
              Months
              <br />
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
                className="w-6 h-6 mt-1 bg-transparent text-neutral-500 font-bold"
                placeholder="0"
              ></input>
            </div>
            <div className="text-xs text-neutral-500">
              Days
              <br />
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-6 h-6 mt-1 bg-transparent text-neutral-500 font-bold"
                placeholder="15"
                min="15"
                max="30"
              ></input>
            </div>
            <button
              className="border w-8 h-8 border-amber-500 text-amber-500 font-semibold"
              onClick={handleIncrement}
            >
              +
            </button>
          </div>
        </div>
        {error && (
          <div className="border w-full border-red-500 bg-red-100 text-xs text-red-500 p-2 mt-4">
            {months === 6
              ? "Error: redeem duration can't exceed 180 days."
              : "Error: redeem duration can't be set to less than 15 days."}
          </div>
        )}
        <Button
          type="button"
          className="text-neutral-500"
          variant="outline"
          // disabled={!approveGfc}
          // loading={isApprovingGfc}
          // onClick={() => approveGfc?.()}
        >
          Redeem
        </Button>
      </div>
      {/* </form> */}
    </Form>
  );
}
