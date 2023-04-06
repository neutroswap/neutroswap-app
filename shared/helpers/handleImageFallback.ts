import { SyntheticEvent } from "react";

export const handleImageFallback = (
  ticker: string,
  event: SyntheticEvent<HTMLImageElement, Event>
) => {
  event.currentTarget.src = `https://ui-avatars.com/api/?background=random&name=${ticker}`;
};
