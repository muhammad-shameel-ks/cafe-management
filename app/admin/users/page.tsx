"use client"

import { useState, useEffect } from "react"
import {
    Search,
    User,
    CreditCard,
    MoreHorizontal,
    Eye,
    Plus,
    Minus,
    RefreshCw,
    QrCode,
    Check,
    History,
    Ban,
    Wallet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"

interface Profile {
    id: string
    unique_id: string
    full_name: string
    phone_number: string
    role: string
    balance: number
    rfid_tag: string | null
    created_at: string
}

interface Transaction {
    id: string
    amount: number
    type: 'credit' | 'debit'
    description: string
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)

    // RFID Generation State
    const [isGeneratingRFID, setIsGeneratingRFID] = useState(false)
    const [rfidDialogOpen, setRfidDialogOpen] = useState(false)
    const [userForRFID, setUserForRFID] = useState<Profile | null>(null)

    // Credit State
    const [creditAmount, setCreditAmount] = useState("")
    const [isAddingCredit, setIsAddingCredit] = useState(false)
    // Deduction State
    const [deductAmount, setDeductAmount] = useState("")
    const [isDeducting, setIsDeducting] = useState(false)
    const [isManageBalanceDialogOpen, setIsManageBalanceDialogOpen] = useState(false)
    const [amountToManage, setAmountToManage] = useState("")
    const [manageBalanceType, setManageBalanceType] = useState<'credit' | 'debit'>('credit')

    const supabase = createClient()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error("Failed to fetch users")
        } else {
            setUsers(data || [])
        }
        setIsLoading(false)
    }

    const fetchTransactions = async (userId: string) => {
        setIsTransactionsLoading(true)
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            toast.error("Failed to fetch transactions")
        } else {
            setTransactions(data || [])
        }
        setIsTransactionsLoading(false)
    }

    const handleViewProfile = (user: Profile) => {
        setSelectedUser(user)
        fetchTransactions(user.id)
    }

    const handleGenerateRFID = async () => {
        if (!userForRFID) return

        setIsGeneratingRFID(true)

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        const newRFID = `RFID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        const { error } = await supabase
            .from('profiles')
            .update({ rfid_tag: newRFID })
            .eq('id', userForRFID.id)

        if (error) {
            toast.error("Failed to generate RFID")
        } else {
            toast.success("RFID Generated Successfully")
            setUsers(users.map(u => u.id === userForRFID.id ? { ...u, rfid_tag: newRFID } : u))
            setRfidDialogOpen(false)
        }
        setIsGeneratingRFID(false)
    };

    const handleDeactivateRFID = async (userId: string) => {
        // Optional: you could set a separate loading state if needed
        setIsGeneratingRFID(true);
        const { error } = await supabase
            .from('profiles')
            .update({ rfid_tag: null })
            .eq('id', userId);
        if (error) {
            toast.error("Failed to deactivate RFID");
        } else {
            toast.success("RFID Deactivated");
            setUsers(users.map(u => u.id === userId ? { ...u, rfid_tag: null } : u));
        }
        setIsGeneratingRFID(false);
    }

    const handleManageBalance = async () => {
        if (!selectedUser || !amountToManage) return

        const amount = parseFloat(amountToManage)
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount")
            return
        }

        const isCredit = manageBalanceType === 'credit'
        const loadingSetter = isCredit ? setIsAddingCredit : setIsDeducting
        loadingSetter(true)

        // 1. Update balance
        const currentBalance = selectedUser.balance || 0
        const newBalance = isCredit ? currentBalance + amount : currentBalance - amount

        if (newBalance < 0) {
            toast.error("Insufficient balance")
            loadingSetter(false)
            return
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', selectedUser.id)

        if (updateError) {
            toast.error("Failed to update balance")
            loadingSetter(false)
            return
        }

        // 2. Create transaction record
        const { error: txError } = await supabase
            .rpc('insert_user_transaction', {
                p_user_id: selectedUser.id,
                p_amount: amount,
                p_type: manageBalanceType,
                p_description: `Admin ${isCredit ? 'added' : 'deducted'} credit`
            })

        if (txError) {
            toast.error("Failed to record transaction")
        } else {
            toast.success(`Balance updated successfully`)
            setAmountToManage("")
            // Refresh local state
            setSelectedUser({ ...selectedUser, balance: newBalance })
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, balance: newBalance } : u))
            fetchTransactions(selectedUser.id)
            setIsManageBalanceDialogOpen(false)
        }
        loadingSetter(false)
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.unique_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.includes(searchQuery)
    )

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage users, generate RFIDs, and view history.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-0 flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Unique ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>RFID Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-mono font-medium">{user.unique_id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{user.phone_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-green-600">
                                            ₹{user.balance?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {user.rfid_tag ? (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                                                    <Check className="w-3 h-3 mr-1" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button variant="ghost" size="icon" onClick={() => handleViewProfile(user)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                                                        <SheetHeader>
                                                            <SheetTitle>User Profile</SheetTitle>
                                                            <SheetDescription>
                                                                View details and transaction history for {selectedUser?.full_name}
                                                            </SheetDescription>
                                                        </SheetHeader>

                                                        {selectedUser && (
                                                            <div className="flex-1 flex flex-col gap-6 mt-6 overflow-hidden">
                                                                {/* User Info Card */}
                                                                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                                                                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                                                                        <User className="w-8 h-8" />
                                                                    </div>
                                                                    <div className="flex-1 space-y-1">
                                                                        <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                                                                        <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                                                            <span>ID: <span className="font-mono text-foreground">{selectedUser.unique_id}</span></span>
                                                                            <span>Phone: {selectedUser.phone_number}</span>
                                                                            <span>RFID: {selectedUser.rfid_tag || "Not Assigned"}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm text-muted-foreground">Balance</div>
                                                                        <div className="text-2xl font-bold text-green-600">₹{selectedUser.balance?.toFixed(2)}</div>
                                                                    </div>
                                                                </div>


                                                                {/* Transaction History */}
                                                                <div className="flex-1 flex flex-col overflow-hidden">
                                                                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                                                                        <History className="w-4 h-4" /> Transaction History
                                                                    </h4>
                                                                    <ScrollArea className="flex-1 -mr-4 pr-4">
                                                                        <div className="space-y-4">
                                                                            {isTransactionsLoading ? (
                                                                                <div className="text-center py-4 text-muted-foreground">Loading transactions...</div>
                                                                            ) : transactions.length === 0 ? (
                                                                                <div className="text-center py-4 text-muted-foreground">No transactions found</div>
                                                                            ) : (
                                                                                transactions.map((tx) => (
                                                                                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                                                {tx.type === 'credit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                                                                            </div>
                                                                                            <div>
                                                                                                <div className="font-medium">{tx.description || (tx.type === 'credit' ? 'Credit Added' : 'Purchase')}</div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                    {new Date(tx.created_at).toLocaleString()}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </SheetContent>
                                                </Sheet>

                                                {user.rfid_tag ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={async () => {
                                                            await handleDeactivateRFID(user.id);
                                                        }}
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                ) : (
                                                    <Dialog open={rfidDialogOpen} onOpenChange={setRfidDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setUserForRFID(user);
                                                                    setRfidDialogOpen(true);
                                                                }}
                                                            >
                                                                <CreditCard className="w-4 h-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Generate RFID Card</DialogTitle>
                                                                <DialogDescription>
                                                                    Generate and assign a new RFID tag for {userForRFID?.full_name}
                                                                </DialogDescription>
                                                            </DialogHeader>

                                                            <div className="flex flex-col items-center justify-center py-6 gap-6">
                                                                {/* 2D Card Preview */}
                                                                <div className="relative w-80 h-48 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-2xl overflow-hidden text-primary-foreground p-6 flex flex-col justify-between transition-all duration-500 hover:scale-105">
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
                                                                            {userForRFID?.full_name || "YOUR NAME"}
                                                                        </div>
                                                                        <div className="flex justify-between items-end mt-2">
                                                                            <div className="text-xs opacity-80 font-mono">
                                                                                {userForRFID?.unique_id || "PRE-XXXX"}
                                                                            </div>
                                                                            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                                                                {userForRFID?.role || "User"}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <DialogFooter className="sm:justify-center">
                                                                <Button
                                                                    className="w-full max-w-xs"
                                                                    onClick={handleGenerateRFID}
                                                                    disabled={isGeneratingRFID}
                                                                >
                                                                    {isGeneratingRFID ? (
                                                                        <>
                                                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                                            Generating Key...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                                            Generate & Assign Key
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
