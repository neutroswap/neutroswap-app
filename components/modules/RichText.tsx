import { classNames } from "@/shared/helpers/classnames";
import useUpdateEffect from "@/shared/hooks/useUpdateEffect";
import { useTheme } from "@geist-ui/core";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill"

interface Props {
  value?: string,
  onChange?: () => void,
}

const RichText: React.FC<Props> = ({
  value, onChange
}) => {
  let quillObj = useRef<any>()
  const theme = useTheme();

  const [focus, setFocus] = useState(false);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          ["bold", "italic", "underline"],
          [{ header: 1 }, { header: 2 }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          ["clean"],
        ],
      },
    }
  }, [])

  useUpdateEffect(() => {
    const handleContextMenu = (event: any) => {
      event.preventDefault()
      const range = quillObj.current?.getEditor().getSelection(true);
      const bounds = quillObj.current?.getEditor().getBounds(range.index);
      (quillObj.current?.getEditor() as any).theme.tooltip.show();
      (quillObj.current?.getEditor() as any).theme.tooltip.position(bounds);
    }

    if (focus) window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [focus])

  return (
    <ReactQuill
      ref={(el) => {
        if (!quillObj.current) return;
        quillObj.current = el
      }}
      theme="bubble"
      modules={modules}
      className={classNames(
        "w-full h-full border border-transparent rounded-md",
        focus && "!border-neutral-400 dark:!border-white"
      )}
      // style={{ borderColor: theme.palette.border }}
      // className={cx(
      //   meta.touched && meta.error
      //     ? "ring-2 ring-red-800 border-red-500"
      //     : focus
      //       ? "ring-2 ring-magenta-700 hover:border-magenta-500"
      //       : "border-neutral-700 hover:border-neutral-700",
      //   "group transition border border-neutral-700",
      //   "rounded-md shadow-sm"
      // )}
      defaultValue={value}
      onChange={onChange}
      onFocus={() => {
        setFocus(true);
      }}
      onBlur={() => {
        setFocus(false);
      }}
      bounds="#form"
    />
  )
}

export default RichText;
