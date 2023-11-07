'use client'

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type Props = {
  src: string,
  className?: string
}
export default function TokenLogo({ src, className }: Props) {
  return (

    <Avatar className={className}>
      <AvatarImage src={src} />
      <AvatarFallback>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon/generic.svg"
          className="grayscale"
        />
      </AvatarFallback>
    </Avatar>
  )
}
