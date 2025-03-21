"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Filter, Search, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"
import { CreateVehicleModal } from "./components/create-vehicle-modal"
import { UpdateVehicleModal } from "./components/update-vehicle-modal"
import { DeleteVehicleModal } from "./components/delete-vehicle-modal"

interface Vehicle {
    id: string
    name?: string
    driver_name: string
    plate_no?: string
    status: "AVAILABLE" | "RESERVED" | "IN_USE" | "MAINTENANCE"
    createdAt: string
    updatedAt: string
}

interface Shipment {
    id: string
    destination: string
    status: string
    createdAt: string
    updatedAt: string
}

export default function Vehicle() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortOrder, setSortOrder] = useState("vehicleId")
    const [activeTab, setActiveTab] = useState("bookings")
    const { toast } = useToast()

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [updateModalData, setUpdateModalData] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
        isOpen: false,
        vehicle: null,
    })
    const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; id: string; vehicleId: string }>({
        isOpen: false,
        id: "",
        vehicleId: "",
    })

    useEffect(() => {
        fetchVehicles()
        fetchShipments()
    }, [])

    async function fetchVehicles() {
        setIsLoading(true)
        try {
            const response = await Axios.get("/api/v1/vehicle/list")
            setVehicles(response.data.data || [])
        } catch (error) {
            toast({ title: "Error", description: "Failed to load vehicles.", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchShipments() {
        try {
            const response = await Axios.get("/api/v1/shipment/list")
            setShipments(response.data.data || [])
        } catch (error) {
            toast({ title: "Error", description: "Failed to load shipments.", variant: "destructive" })
        }
    }

    function handleOpenUpdateModal(vehicle: Vehicle) {
        setUpdateModalData({ isOpen: true, vehicle })
    }

    function handleCloseUpdateModal() {
        setUpdateModalData({ isOpen: false, vehicle: null })
    }

    function handleOpenDeleteModal(id: string, vehicleId: string) {
        setDeleteModalData({ isOpen: true, id, vehicleId })
    }

    function handleCloseDeleteModal() {
        setDeleteModalData({ isOpen: false, id: "", vehicleId: "" })
    }

    function formatDate(dateString: string) {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }


    const filteredVehicles = vehicles
        .filter(vehicle =>
            vehicle.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vehicle.plate_no && vehicle.plate_no.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortOrder === "vehicleId") return a.id.localeCompare(b.id)
            if (sortOrder === "status") return a.status.localeCompare(b.status)
            return 0
        })

    function getStatusBadge(status: string) {
        const statusMap: Record<string, string> = {
            AVAILABLE: "green",
            IN_USE: "blue",
            MAINTENANCE: "yellow",
            RESERVED: "purple",
        }
        const color = statusMap[status] || "gray"
        return (
            <Badge variant="outline" className={`bg-${color}-500/10 text-${color}-500 border-${color}-500/20`}>
                {status.replace("_", " ")}
            </Badge>
        )
    }

    return (
        <>
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Vehicle Reservation System</h1>
                <Button className="ml-auto" size="sm" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Vehicle
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Management</CardTitle>
                    <CardDescription>
                        This system manages the scheduling and allocation of hospital vehicles for transporting medical supplies,
                        equipment, and staff.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="bookings" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="bookings">Vehicles</TabsTrigger>
                            <TabsTrigger value="shipments">Shipments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="bookings" className="mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search vehicles..."
                                            className="pl-8 w-[250px]"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" /> Filter
                                    </Button>
                                </div>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vehicleId">Vehicle ID</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex items-center">
                                                Vehicle ID <ArrowUpDown className="ml-1 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>License Plate</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">Loading vehicles...</TableCell>
                                        </TableRow>
                                    ) : filteredVehicles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                {searchTerm ? "No vehicles found matching your search" : "No vehicles found. Add your first vehicle."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredVehicles.map((vehicle) => (
                                            <TableRow key={vehicle.id}>
                                                <TableCell className="font-medium">{vehicle.id}</TableCell>
                                                <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                                                <TableCell>{vehicle.plate_no || "N/A"}</TableCell>
                                                <TableCell>{vehicle.driver_name || "Unassigned"}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenUpdateModal(vehicle)}>
                                                            <Edit className="h-4 w-4" /><span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                            onClick={() => handleOpenDeleteModal(vehicle.id, vehicle.plate_no || "")}
                                                        >
                                                            <Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="shipments" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shipment ID</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Start</TableHead>
                                        <TableHead>End</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">No shipments available.</TableCell>
                                        </TableRow>
                                    ) : (
                                        shipments.map((shipment: any) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell>{shipment.id}</TableCell>
                                                <TableCell>{shipment.destination}</TableCell>
                                                <TableCell>{formatDate(shipment.start)}</TableCell>
                                                <TableCell>{formatDate(shipment.end)}</TableCell>
                                                <TableCell>{new Date(shipment.createdAt).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <CreateVehicleModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchVehicles} />
            <UpdateVehicleModal isOpen={updateModalData.isOpen} onClose={handleCloseUpdateModal} onSuccess={fetchVehicles} vehicle={updateModalData.vehicle} />
            <DeleteVehicleModal isOpen={deleteModalData.isOpen} onClose={handleCloseDeleteModal} onSuccess={fetchVehicles} vehicleId={deleteModalData.vehicleId} id={deleteModalData.id} />
        </>
    )
}
