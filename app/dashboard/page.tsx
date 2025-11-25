"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreditCard, History, User, LogOut, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Profile {
    id: string
    unique_id: string
    full_name: string
    balance: number
    rfid_tag: string | null
}

interface Transaction {
    id: string
    amount: number
    type: 'credit' | 'debit'
    description: string
    created_at: string
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/login")
                return
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)

                const { data: txData } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (txData) setTransactions(txData)
            }
            setLoading(false)
        }
        fetchData()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        toast.success("Signed out successfully")
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-muted/20 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
                    <Button variant="outline" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Profile Details
                            </CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profile?.full_name}</div>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                ID: {profile?.unique_id}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">RFID Status:</span>
                                {profile?.rfid_tag ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                                        Pending
                                    </Badge>
                                )}
                            </div>
                            {!profile?.rfid_tag && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                    Please contact the admin to generate your RFID card to use the service.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balance Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Balance
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₹{profile?.balance.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Available for use at POS
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" /> Transaction History
                        </CardTitle>
                        <CardDescription>
                            Recent activity on your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No transactions yet
                                    </div>
                                ) : (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                                            <div className="flex items-center gap-4">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
