"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Filter, Trash2, Eye } from "lucide-react"
import {
    Card, CardHeader, CardTitle, CardDescription,
    CardContent,
} from "@/components/ui/card"
import {
    Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { CreateBudgetRequestModal } from "./components/create-budget-modal"
import axios from "axios"

interface BudgetRequest {
    _id: string
    date: string
    department: string
    budgetType: string
    description: string
    amount: number
    status: string
}

export default function BudgetRequestPage() {
    const { toast } = useToast()
    const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("date")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        fetchBudgetRequests()
    }, [])

    async function fetchBudgetRequests() {
        setIsLoading(true)
        try {
            const res = await axios.get("https://backend-finance.nodadogenhospital.com/budget/get-requests", {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            setBudgetRequests(res.data.requests || [])
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to fetch budget requests",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return "N/A"
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const filtered = budgetRequests
        .filter((b) =>
            b._id.includes(searchTerm) ||
            b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "amount") {
                return b.amount - a.amount
            } else {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            }
        })

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Budget Request Management</h1>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Budget Request
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Budget Requests</CardTitle>
                    <CardDescription>Review and manage all submitted budget requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search budget requests..."
                                    className="pl-8 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        Loading budget requests...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        {searchTerm ? "No results found." : "No budget requests found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell>{request._id.slice(-6)}</TableCell>
                                        <TableCell>{formatDate(request.date)}</TableCell>
                                        <TableCell>{request.department}</TableCell>
                                        <TableCell>{request.budgetType}</TableCell>
                                        <TableCell>{request.description}</TableCell>
                                        <TableCell>${request.amount.toFixed(2)}</TableCell>
                                        <TableCell>{request.status}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateBudgetRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchBudgetRequests}
            />
        </>
    )
}
