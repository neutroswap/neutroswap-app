import React, {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  HTMLInputTypeAttribute,
} from "react";
import { classNames } from "@/shared/helpers/classNamer";
import { useDebounce } from "@/shared/hooks/useDebounce";

type SimpleProps<L, R> = R & Pick<L, Exclude<keyof L, keyof R>>;

interface ExtraProps {
  onChange?: Dispatch<SetStateAction<string>>;
}

interface Props
  extends SimpleProps<React.HTMLProps<HTMLInputElement>, ExtraProps> {
  localeOptions?: {
    style?: "decimal" | "currency" | "percent" | "unit";
    maximumFractionDigits?: number;
    minimumSignificantDigits?: number;
    maximumSignificantDigits?: number;
    numberingSystem?: string;
    currencySign?: string;
    currency?: string;
    unit?: string;
    unitDisplay?: "long" | "short" | "narrow";
    currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
    notation?: "standard" | "scientific" | "engineering" | "compact";
    signDisplay?: "auto" | "never" | "always" | "exceptZero";
  };
}

// const NumberInput: React.FC<Props> = ({
const NumberInput: React.FC<Props> = ({
  inputMode,
  onChange,
  onFocus,
  onBlur,
  defaultValue,
  localeOptions,
  min = 0,
  ...rest
}) => {
  const [lastValue, setLastValue] = useState(+defaultValue! || "");
  const [value, setValue] = useState(+defaultValue! || "");
  const [error, setError] = useState(false);
  const debouncedValue = useDebounce(value, 500);
  const [type, setType] = useState("number");
  const isMounted = useRef(false);
  const inputRef: any = useRef(null);

  useEffect(() => {
    if (isMounted.current) {
      numberToText(+defaultValue!);
    }
  }, [defaultValue]);

  useEffect(() => {
    numberToText();
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!+debouncedValue) return;
    // if (+debouncedValue < min) return;
    onChange && onChange(debouncedValue.toString());
  }, [debouncedValue, onChange]);

  function textToNumber() {
    setType("number");
    setValue(lastValue);
  }

  function numberToText(num = value) {
    setType("");
    setLastValue(num || "");
    // setValue(num == '' ? '' : (+num).toLocaleString(undefined, localeOptions))
    setValue(num == "" ? "" : (+num).toString());
  }

  function onFocusLocal(e: any) {
    textToNumber();
    onFocus && onFocus(e);
  }

  function onBlurLocal(e: any) {
    numberToText();
    onBlur && onBlur(e);
  }

  function onChangeLocal() {
    if (+inputRef.current.value !== 0 && +inputRef.current.value < min)
      return setError(true);
    setError(false);
    setValue(inputRef.current.value);
  }

  return (
    <div>
      <input
        {...rest}
        ref={inputRef}
        type={type}
        value={value}
        inputMode={inputMode || "decimal"}
        onChange={onChangeLocal}
        onFocus={onFocusLocal}
        onBlur={onBlurLocal}
      />
      {error && (
        <span className="text-xs text-red-400">
          Minimum value of {min} are required
        </span>
      )}
    </div>
  );
};

export default NumberInput;
