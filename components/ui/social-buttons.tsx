import type React from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { ComponentProps } from "react"

interface SocialButtonProps extends ComponentProps<typeof Button> {
  provider: "google" | "facebook" | "apple"
  children: React.ReactNode
}

export function SocialButton({ provider, children, ...props }: SocialButtonProps) {
  const providerStyles = {
    google: {
      bg: "bg-white",
      hover: "hover:bg-gray-50",
      border: "border border-gray-300",
      text: "text-gray-700",
      logo: "/icons/google.svg",
    },
    facebook: {
      bg: "bg-[#1877F2]",
      hover: "hover:bg-[#166fe5]",
      border: "border-0",
      text: "text-white",
      logo: "/icons/facebook.svg",
    },
    apple: {
      bg: "bg-black",
      hover: "hover:bg-gray-900",
      border: "border-0",
      text: "text-white",
      logo: "/icons/apple.svg",
    },
  }

  const style = providerStyles[provider]

  return (
    <Button
      variant="outline"
      className={`w-full flex items-center justify-center gap-2 ${style.bg} ${style.hover} ${style.border} ${style.text}`}
      {...props}
    >
      <Image
        src={style.logo || "/placeholder.svg"}
        alt={`${provider} logo`}
        width={20}
        height={20}
        className="h-5 w-5"
      />
      <span>{children}</span>
    </Button>
  )
}
