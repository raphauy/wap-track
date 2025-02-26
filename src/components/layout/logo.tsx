"use client"

import { useTheme } from "next-themes"
import Image from "next/image"

export const text1= "Wap"
export const text2= "Track"
export const image= false

export function Logo() {
    const { theme } = useTheme()
    const logoImage= theme === "dark" ? "/logo-for-dark.png" : "/logo-for-light.png"

    return (
        <>
        {image ? (
            <div className="relative h-14 w-52">
                <Image 
                    src={logoImage} 
                    alt="Logo" 
                    fill
                    priority
                    className="object-contain"
                />
            </div>
        ) : (
            <div className="flex items-center">
                {/* use the whatsapp green color */}
            <span className="text-[#008000]">{text1}</span>
            <span className="text-muted-foreground">{text2}</span>
            </div>
        )}
        </>
    )
} 