"use client"

import { useState } from "react"
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, User, QrCode, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    price: number
    category: string
    image: string
}

const products: Product[] = [
    { id: "1", name: "Espresso", price: 120, category: "Coffee", image: "☕" },
    { id: "2", name: "Cappuccino", price: 180, category: "Coffee", image: "🥛" },
    { id: "3", name: "Latte", price: 200, category: "Coffee", image: "🧊" },
    { id: "4", name: "Mocha", price: 220, category: "Coffee", image: "🍫" },
    { id: "5", name: "Croissant", price: 150, category: "Snacks", image: "🥐" },
    { id: "6", name: "Muffin", price: 120, category: "Snacks", image: "🧁" },
    { id: "7", name: "Sandwich", price: 250, category: "Food", image: "🥪" },
    { id: "8", name: "Salad", price: 300, category: "Food", image: "🥗" },
    { id: "9", name: "Tea", price: 80, category: "Drinks", image: "🍵" },
    { id: "10", name: "Juice", price: 100, category: "Drinks", image: "🧃" },
]

interface CartItem extends Product {
    quantity: number
}

export default function POSPage() {
    const router = useRouter()
    const [cart, setCart] = useState<CartItem[]>([])
    const [paymentMethod, setPaymentMethod] = useState("employee")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("All")

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + delta
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
                }
                return item
            })
        )
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.05 // 5% tax
    const total = subtotal + tax

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = activeCategory === "All" || product.category === activeCategory
        return matchesSearch && matchesCategory
    })

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("Cart is empty")
            return
        }
        toast.success(`Order placed successfully! Paid via ${paymentMethod}`)
        setCart([])
    }

    return (
        <div className="flex h-screen bg-muted/20 overflow-hidden">
            {/* Left Side - Products */}
            <div className="flex-1 flex flex-col p-4 gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.push("/admin")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-primary">Cafe POS</h1>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="All" className="w-full" onValueChange={setActiveCategory}>
                    <TabsList>
                        {categories.map((category) => (
                            <TabsTrigger key={category} value={category}>
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                                onClick={() => addToCart(product)}
                            >
                                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                                    <div className="text-4xl">{product.image}</div>
                                    <div className="font-semibold">{product.name}</div>
                                    <Badge variant="secondary">₹{product.price}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Side - Cart */}
            <div className="w-96 bg-background border-l flex flex-col shadow-xl">
                <div className="p-4 border-b bg-muted/10">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Current Order
                    </h2>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border bg-card">
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl">{item.image}</div>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">₹{item.price} x {item.quantity}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive ml-1" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                Cart is empty
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/10 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (5%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-2">
                            <div>
                                <RadioGroupItem value="employee" id="employee" className="peer sr-only" />
                                <Label
                                    htmlFor="employee"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <User className="mb-2 h-4 w-4" />
                                    Employee
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                                <Label
                                    htmlFor="cash"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Banknote className="mb-2 h-4 w-4" />
                                    Cash
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                                <Label
                                    htmlFor="upi"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <QrCode className="mb-2 h-4 w-4" />
                                    UPI
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                <Label
                                    htmlFor="card"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <CreditCard className="mb-2 h-4 w-4" />
                                    Card
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={cart.length === 0}>
                        Checkout ₹{total.toFixed(2)}
                    </Button>
                </div>
            </div>
        </div>
    )
}
