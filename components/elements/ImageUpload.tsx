import React, { useEffect, useRef, useState } from "react";
// import { supabase } from "shared/helpers/supabaseClient";
import {
  registerPlugin,
} from "filepond";
import { FilePond, FilePondProps } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

export type ImageUploadProps = {
  setPublicUrl: React.Dispatch<React.SetStateAction<string>>;
  bucket: string;
  setTouched?: (value: boolean, shouldValidate?: boolean | undefined) => void;
} & FilePondProps;

const ImageUploadRender: React.ForwardRefRenderFunction<
  FilePond | any,
  ImageUploadProps
> = (props, ref) => {

  // const serverOptions: FilePondServerConfigProps = {
  //   server: {
  //     process: async (
  //       fieldName,
  //       file,
  //       metadata,
  //       load,
  //       error,
  //       progress,
  //       abort
  //     ) => {
  //       if (props.setTouched) {
  //         props.setTouched(true);
  //       }

  //       const formData = new FormData();
  //       formData.append(fieldName, file, file.name);

  //       const fileName = file.name.split(".").shift();
  //       const fileExtension = file.name.split(".").pop();
  //       const randomizeFileName = `${fileName}_${Math.random()}.${fileExtension}`;

  //       progress(false, 0, 100);

  //       let { data, error: uploadError } = await supabase.storage
  //         .from(props.bucket)
  //         .upload(randomizeFileName, file);

  //       if (uploadError) {
  //         console.log(uploadError);
  //         error(uploadError.message);
  //       }

  //       const { publicURL, error: publicUrlError } = supabase.storage
  //         .from(props.bucket)
  //         .getPublicUrl(randomizeFileName);

  //       if (publicUrlError) {
  //         throw publicUrlError;
  //       }

  //       if (publicURL) {
  //         props.setPublicUrl(publicURL);
  //       }

  //       if (data) {
  //         console.log(data.Key);
  //         load(data.Key);
  //       }

  //       return {
  //         abort: () => {
  //           abort();
  //         },
  //       };
  //     },

  //     load: async (source, load, error, progress) => {
  //       progress(true, 0, 1024);

  //       const { data, error: responseError } = await supabase.storage
  //         .from(props.bucket)
  //         .download(source);

  //       if (responseError) {
  //         console.log(responseError);
  //         throw responseError;
  //       }

  //       if (data) {
  //         load(data);
  //       } else {
  //         error("oh no something's wrong");
  //       }
  //     },

  //     revert: async (uniqueFileId, load, error) => {
  //       const fileName = uniqueFileId.split("/").pop();
  //       console.log(fileName);

  //       const { data, error: responseError } = await supabase.storage
  //         .from(props.bucket)
  //         .remove([fileName]);

  //       if (responseError) {
  //         console.log(responseError);
  //         throw responseError;
  //       }

  //       if (data) {
  //         props.setPublicUrl("");
  //         load();
  //       } else {
  //         error("oh no something's wrong");
  //       }
  //     },
  //   },
  // };

  return (
    <>
      <FilePond
        ref={ref}
        allowMultiple={false}
        onupdatefiles={(files) => props.setPublicUrl(files[0].source as string)}
        // server={serverOptions.server}
        {...props}
      />
    </>
  );
};

const ImageUpload = React.forwardRef(ImageUploadRender);

export default ImageUpload;
