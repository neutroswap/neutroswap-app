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

export default function ConvertForm() {
  const form = useForm();
  //   const convertGrailToXgrail = useWatch({
  //     control: form.control,
  //     name: "convertGrailToXgrail",
  //   });
  return (
    <Form {...form}>
      <form>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-bold">Get xGRAIL</div>
            <p className="text-sm font-normal leading-5 text-gray-500">
              Unlock bonus rewards and exclusive benefits by converting your
              GRAIL to xGRAIL.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <FormField
              control={form.control}
              name="convertGrailToXgrail"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup
                      suffix={
                        <button
                          type="button"
                          className="mr-1.5 mt-2 rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase leading-5 text-neutral-600"
                          //   onClick={() =>
                          //     form.setValue("convertGfcToXgfc", availableGfc)
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
          {/* {(() => {
            if (!isApproved) {
              return ( */}
          <Button
            type="button"
            className="text-neutral-500"
            variant="outline"
            // disabled={!approveGfc}
            // loading={isApprovingGfc}
            // onClick={() => approveGfc?.()}
          >
            Approve GRAIL
          </Button>
          {/* //   );
            // }
            // return ( */}
          {/* <Button
            type="submit"
            variant="outline"
            // disabled={!convertGfc}
            // loading={isConvertGfcLoading}
          >
            Convert GRAIL
          </Button> */}
          {/* ); */}
          {/* })()} */}
        </div>
      </form>
    </Form>
  );
}
