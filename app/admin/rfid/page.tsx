"use client"

import { useState } from "react"
import { CreditCard, QrCode, User, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface RFIDKey {
    id: string
    name: string
    employeeId: string
    role: string
    status: "Active" | "Inactive"
    generatedAt: string
}

export default function RFIDPage() {
    const [name, setName] = useState("")
    const [employeeId, setEmployeeId] = useState("")
    const [role, setRole] = useState("Employee")
    const [isGenerating, setIsGenerating] = useState(false)
    const [recentKeys, setRecentKeys] = useState<RFIDKey[]>([
        { id: "RF-8823", name: "Alice Johnson", employeeId: "EMP001", role: "Manager", status: "Active", generatedAt: "2 mins ago" },
        { id: "RF-9912", name: "Bob Smith", employeeId: "EMP002", role: "Employee", status: "Active", generatedAt: "1 hour ago" },
    ])

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault()
        setIsGenerating(true)

        // Simulate API call
        setTimeout(() => {
            const newKey: RFIDKey = {
                id: `RF-${Math.floor(1000 + Math.random() * 9000)}`,
                name: name || "Unknown User",
                employeeId: employeeId || "EMP-XXX",
                role: role,
                status: "Active",
                generatedAt: "Just now",
            }
            setRecentKeys([newKey, ...recentKeys])
            setIsGenerating(false)
            toast.success("RFID Key Generated Successfully")
        }, 1500)
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Generate New RFID Key</CardTitle>
                        <CardDescription>Enter user details to provision a new access card.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employeeId">Employee ID</Label>
                                <Input
                                    id="employeeId"
                                    placeholder="EMP-12345"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option>Employee</option>
                                    <option>Manager</option>
                                    <option>Admin</option>
                                    <option>Guest</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full" disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Key...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Generate Key
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 flex flex-col items-center justify-center bg-muted/20">
                    <CardHeader className="w-full text-center">
                        <CardTitle>Card Preview</CardTitle>
                        <CardDescription>Visual representation of the generated card</CardDescription>
                    </CardHeader>
                    <CardContent className="w-full flex justify-center">
                        {/* 2D Card Preview */}
                        <div className="relative w-80 h-48 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-2xl overflow-hidden text-primary-foreground p-6 flex flex-col justify-between transition-all duration-500 hover:scale-105">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

                            <div className="flex justify-between items-start z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold tracking-wider text-sm opacity-90">CAFE PASS</span>
                                </div>
                                <QrCode className="w-8 h-8 opacity-80" />
                            </div>

                            <div className="z-10 space-y-1">
                                <div className="text-xs opacity-70 uppercase tracking-widest">Card Holder</div>
                                <div className="font-bold text-lg tracking-wide truncate">
                                    {name || "YOUR NAME"}
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <div className="text-xs opacity-80 font-mono">
                                        {employeeId || "EMP-00000"}
                                    </div>
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                        {role}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        This preview updates in real-time as you type.
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recently Generated Keys</CardTitle>
                    <CardDescription>History of the last 5 generated RFID keys.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Generated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentKeys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium font-mono">{key.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            {key.name}
                                            <span className="text-xs text-muted-foreground">({key.employeeId})</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{key.role}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                            <Check className="w-3 h-3 mr-1" />
                                            {key.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{key.generatedAt}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
