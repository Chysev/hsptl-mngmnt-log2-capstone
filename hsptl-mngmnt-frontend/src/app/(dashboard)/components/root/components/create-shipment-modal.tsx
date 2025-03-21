"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

const shipmentSchema = z.object({
    destination: z.string().min(1, { message: "Destination is required" }),
    start: z.string().min(1, { message: "Start date is required" }),
    end: z.string().min(1, { message: "End date is required" }),
    description: z.string().optional(),
    vehicle_id: z.string().min(1, { message: "Vehicle is required" }),
    orders_id: z.string().min(1, { message: "Please select an order" }),
})

type ShipmentFormValues = z.infer<typeof shipmentSchema>

interface CreateShipmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

interface Order {
    id: string
    destination: string
    products: { name: string; quantity: number }[]
}

interface Vehicle {
    id: string
    name: string
    driver_name: string
    plate_no: string
    vehicleId: string
    type: string
}

export function CreateShipmentModal({ isOpen, onClose, onSuccess }: CreateShipmentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
    const [isLoadingOrders, setIsLoadingOrders] = useState(false)
    const { toast } = useToast()

    const form = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            destination: "",
            start: new Date().toISOString().split("T")[0],
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            description: "",
            vehicle_id: "",
            orders_id: "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            fetchVehicles()
            fetchOrders()
        }
    }, [isOpen])

    async function fetchVehicles() {
        setIsLoadingVehicles(true)
        try {
            const response = await Axios.get("/api/v1/vehicle/list")
            setVehicles(response.data.data || [])
        } catch {
            toast({
                title: "Error",
                description: "Failed to load vehicles. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingVehicles(false)
        }
    }

    async function fetchOrders() {
        setIsLoadingOrders(true)
        try {
            const response = await Axios.get("/api/v1/orders/list")
            setOrders(response.data.data || [])
        } catch {
            toast({
                title: "Error",
                description: "Failed to load orders. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingOrders(false)
        }
    }

    async function onSubmit(data: ShipmentFormValues) {
        setIsLoading(true)
        try {
            const payload = {
                ...data,
                orders_id: [data.orders_id],
            }

            await Axios.post("/api/v1/shipment/create", payload)
            toast({
                title: "Shipment created",
                description: "Shipment has been created successfully.",
            })
            form.reset()
            onSuccess()
            onClose()
        } catch {
            toast({
                title: "Error",
                description: "Failed to create shipment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Shipment</DialogTitle>
                    <DialogDescription>
                        Select an order and assign it to a vehicle.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter destination" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter description (optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicle_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a vehicle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingVehicles ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading vehicles...
                                                </SelectItem>
                                            ) : vehicles.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No vehicles available
                                                </SelectItem>
                                            ) : (
                                                vehicles.map((v) => (
                                                    <SelectItem key={v.id} value={v.id}>
                                                        {v.name} ({v.plate_no}) - {v.driver_name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="orders_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an order" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingOrders ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading orders...
                                                </SelectItem>
                                            ) : orders.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    No orders available
                                                </SelectItem>
                                            ) : (
                                                orders.map((order) => (
                                                    <SelectItem key={order.id} value={order.id}>
                                                        {order.id} - {order.destination}
                                                    </SelectItem>

                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    "Create Shipment"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
