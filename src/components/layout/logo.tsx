"use client"

import { useTheme } from "next-themes"
import Image from "next/image"

export const text1= "RC"
export const text2= "Starter"
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
            <span className="text-foreground">{text1}</span>
            <span className="text-muted-foreground">{text2}</span>
            </div>
        )}
        </>
    )
} 