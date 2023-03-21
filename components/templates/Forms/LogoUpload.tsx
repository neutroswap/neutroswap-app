import React, { useEffect, useRef, useState } from "react";

import { FilePond } from "filepond";
import ImageUpload from "@/components/elements/ImageUpload";
import { renderToString } from "react-dom/server";
import { useFormContext } from "react-hook-form";

const LogoUploadStatic: React.FC = (props) => {
  let pond = useRef<FilePond>(null);

  const { register, setValue, watch } = useFormContext();
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    console.log('image', image);
    setValue('logo', image);
  }, [image, setValue]);

  return (
    <>
      <input hidden type="text" {...register('logo')} />
      <ImageUpload
        bucket={""}
        setPublicUrl={setImage}
        stylePanelLayout="compact"
        styleLoadIndicatorPosition="center bottom"
        styleProgressIndicatorPosition="right bottom"
        styleButtonRemoveItemPosition="left bottom"
        styleButtonProcessItemPosition="right bottom"
        labelIdle={(() => {
          return renderToString(
            <div className="mt-2 text-neutral-400">
              <svg
                className="w-10 h-10 mx-auto text-neutral-500 hover:cursor-pointer"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-1 w-[80%] !text-xs mx-auto">Upload your logo here</p>
            </div>
          );
        })()}
      />
    </>
  );
};

export default LogoUploadStatic;
