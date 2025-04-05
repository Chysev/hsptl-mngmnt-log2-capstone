"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Trash2, Eye } from "lucide-react"
import {
    Card, CardHeader, CardTitle, CardDescription,
    CardContent
} from "@/components/ui/card"
import {
    Table, TableHeader, TableBody, TableRow, TableCell, TableHead
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { CreateShipmentModal } from "./components/create-shipment-modal"
import useUserData from "@/hooks/use-user-data"
import { useTokenContext } from "@/context/TokenProvider"
import { useRouter } from "next/navigation"
import { UseQueryResult } from "@tanstack/react-query"
import { User } from "@/types"

interface Shipment {
    id: string
    destination: string
    start: string
    end: string
    description: string
    createdAt?: string
    updatedAt?: string
}

export default function ShipmentsPage() {
    const { toast } = useToast()
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("id")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const { sessionToken } = useTokenContext()
    const router = useRouter();

    const { data: user }: UseQueryResult<{ data: { user: User } }> = useUserData(
        sessionToken,
        router
    );


    useEffect(() => {
        fetchShipments()
    }, [])

    async function fetchShipments() {
        setIsLoading(true)
        try {
            const res = await Axios.get("/api/v1/shipment/list")
            setShipments(res.data.data || [])
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to fetch shipments",
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

    const filtered = shipments
        .filter((s) =>
            s.id.includes(searchTerm) ||
            s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "destination") {
                return a.destination.localeCompare(b.destination)
            } else if (sortBy === "start") {
                return new Date(a.start).getTime() - new Date(b.start).getTime()
            } else {
                return a.id.localeCompare(b.id)
            }
        })

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Shipment Management</h1>
                {["VENDOR", "ADMIN"].includes(user?.data?.user?.role as string) && (
                    <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Shipment
                    </Button>
                )}
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Shipments</CardTitle>
                    <CardDescription>Manage and track all shipment records.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search shipments..."
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
                                <SelectItem value="id">Shipment ID</SelectItem>
                                <SelectItem value="destination">Destination</SelectItem>
                                <SelectItem value="start">Start Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        Loading shipments...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        {searchTerm ? "No results found." : "No shipments found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell>{shipment.id}</TableCell>
                                        <TableCell>{shipment.destination}</TableCell>
                                        <TableCell>{formatDate(shipment.start)}</TableCell>
                                        <TableCell>{formatDate(shipment.end)}</TableCell>
                                        <TableCell>{shipment.description}</TableCell>
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

            <CreateShipmentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchShipments}
            />
        </>
    )
}
