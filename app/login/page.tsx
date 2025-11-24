"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        // Mock login delay
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Logged in successfully")
            // Force hard navigation to avoid potential hydration mismatches during dev
            window.location.href = "/admin"
        }, 1000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <Coffee className="w-10 h-10" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">Cafe Manager</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="admin@cafe.com" required className="border-primary/20 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a href="#" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <Input id="password" type="password" required className="border-primary/20 focus-visible:ring-primary" />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-sm text-muted-foreground justify-center">
                    Protected by RFID Security System
                </CardFooter>
            </Card>
        </div>
    )
}
