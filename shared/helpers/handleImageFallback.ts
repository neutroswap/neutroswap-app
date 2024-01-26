import { SyntheticEvent } from "react";

export const handleImageFallback = (
  ticker: string,
  event: SyntheticEvent<HTMLImageElement, Event>
) => {
  if (ticker === "NEUTRO") {
    event.currentTarget.src = "/logo/neutro_token.svg";
  } else {
    event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${ticker}`;
  }
};
