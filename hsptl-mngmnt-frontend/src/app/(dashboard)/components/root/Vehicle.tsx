"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Trash2, Edit } from "lucide-react"
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card"
import {
    Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
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

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("id")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [updateModalData, setUpdateModalData] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
        isOpen: false, vehicle: null,
    })
    const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; id: string; vehicleId: string }>({
        isOpen: false, id: "", vehicleId: "",
    })
    const { toast } = useToast()

    useEffect(() => {
        fetchVehicles()
    }, [])

    async function fetchVehicles() {
        setIsLoading(true)
        try {
            const res = await Axios.get("/api/v1/vehicle/list")
            setVehicles(res.data.data || [])
        } catch (err) {
            toast({ title: "Error", description: "Failed to load vehicles", variant: "destructive" })
        } finally {
            setIsLoading(false)
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

    function getStatusBadge(status: Vehicle["status"]) {
        const colorMap: Record<Vehicle["status"], string> = {
            AVAILABLE: "green",
            RESERVED: "purple",
            IN_USE: "blue",
            MAINTENANCE: "yellow",
        }
        const color = colorMap[status]
        return (
            <Badge variant="outline" className={`bg-${color}-500/10 text-${color}-500 border-${color}-500/20`}>
                {status.replace("_", " ")}
            </Badge>
        )
    }

    const filtered = vehicles
        .filter(v =>
            v.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.plate_no && v.plate_no.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === "status") return a.status.localeCompare(b.status)
            return a.id.localeCompare(b.id)
        })

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Vehicle Management</h1>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Vehicles</CardTitle>
                    <CardDescription>Manage and track all hospital vehicles.</CardDescription>
                </CardHeader>
                <CardContent>
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

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id">Vehicle ID</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>License Plate</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        {searchTerm ? "No results found." : "No vehicles found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map(vehicle => (
                                    <TableRow key={vehicle.id}>
                                        <TableCell>{vehicle.id}</TableCell>
                                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                                        <TableCell>{vehicle.plate_no || "N/A"}</TableCell>
                                        <TableCell>{vehicle.driver_name}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenUpdateModal(vehicle)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleOpenDeleteModal(vehicle.id, vehicle.plate_no || "")}
                                                >
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

            <CreateVehicleModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchVehicles} />
            <UpdateVehicleModal isOpen={updateModalData.isOpen} onClose={handleCloseUpdateModal} onSuccess={fetchVehicles} vehicle={updateModalData.vehicle} />
            <DeleteVehicleModal isOpen={deleteModalData.isOpen} onClose={handleCloseDeleteModal} onSuccess={fetchVehicles} vehicleId={deleteModalData.vehicleId} id={deleteModalData.id} />
        </>
    )
}
