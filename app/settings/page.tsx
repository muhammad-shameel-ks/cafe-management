"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Check, Palette, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

const PRESET_COLORS = [
    { name: "Vibrant Green", value: "oklch(0.6 0.18 145)" },
    { name: "Ocean Blue", value: "oklch(0.6 0.18 250)" },
    { name: "Royal Purple", value: "oklch(0.6 0.18 290)" },
    { name: "Hot Pink", value: "oklch(0.6 0.18 330)" },
    { name: "Sunset Orange", value: "oklch(0.6 0.18 40)" },
]

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [primaryColor, setPrimaryColor] = useState("oklch(0.6 0.18 145)")
    const [customColor, setCustomColor] = useState("#16a34a") // Fallback hex for input

    useEffect(() => {
        // Load saved color from local storage or default
        const savedColor = localStorage.getItem("theme-primary")
        if (savedColor) {
            setPrimaryColor(savedColor)
            updateThemeColor(savedColor)
        }
    }, [])

    const updateThemeColor = (color: string) => {
        const root = document.documentElement
        root.style.setProperty("--primary", color)
        root.style.setProperty("--ring", color)
        root.style.setProperty("--sidebar-primary", color)
        root.style.setProperty("--sidebar-ring", color)
        localStorage.setItem("theme-primary", color)
        setPrimaryColor(color)
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value
        setCustomColor(hex)
        // Simple conversion to oklch or just use hex (Tailwind v4 supports hex in vars if configured, but we used oklch in globals)
        // For simplicity in this dynamic update, we'll just set the variable. 
        // Note: To maintain consistency with oklch, we might want to convert, but browsers support hex in vars.
        // However, our globals.css uses oklch. Let's try setting it directly.
        updateThemeColor(hex)
    }

    const resetTheme = () => {
        const defaultColor = "oklch(0.6 0.18 145)"
        updateThemeColor(defaultColor)
        setCustomColor("#16a34a")
        toast.success("Theme reset to default")
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Theme Mode</Label>
                                <div className="text-sm text-muted-foreground">
                                    Toggle between light and dark modes.
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Sun className="h-4 w-4 text-muted-foreground" />
                                <Switch
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                />
                                <Moon className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Primary Color</Label>
                                <div className="text-sm text-muted-foreground">
                                    Select a preset or choose a custom color.
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => updateThemeColor(color.value)}
                                        title={color.name}
                                    >
                                        {primaryColor === color.value && (
                                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Label htmlFor="custom-color" className="sr-only">Custom Color</Label>
                                    <div className="flex items-center gap-2 border rounded-md p-2">
                                        <Palette className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Custom:</span>
                                        <Input
                                            id="custom-color"
                                            type="color"
                                            value={customColor}
                                            onChange={handleColorChange}
                                            className="h-8 w-full p-0 border-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <Button variant="outline" size="icon" onClick={resetTheme} title="Reset to Default">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
