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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

// ✅ Aligned with Prisma model
const vehicleSchema = z.object({
    id: z.string().min(1, { message: "Vehicle ID is required" }),
    name: z.string().optional(),
    driver_name: z.string().min(1, { message: "Driver name is required" }),
    plate_no: z.string().optional(),
    status: z.enum(["AVAILABLE", "RESERVED", "IN_USE", "MAINTENANCE"]),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

interface Vehicle {
    id: string
    name?: string
    driver_name: string
    plate_no?: string
    status: "AVAILABLE" | "RESERVED" | "IN_USE" | "MAINTENANCE"
    createdAt: string
    updatedAt: string
}

interface UpdateVehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    vehicle: Vehicle | null
}

export function UpdateVehicleModal({ isOpen, onClose, onSuccess, vehicle }: UpdateVehicleModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            id: "",
            name: "",
            driver_name: "",
            plate_no: "",
            status: "AVAILABLE",
        },
    })

    // Sync form with vehicle prop
    useEffect(() => {
        if (vehicle) {
            form.reset({
                id: vehicle.id,
                name: vehicle.name || "",
                driver_name: vehicle.driver_name,
                plate_no: vehicle.plate_no || "",
                status: vehicle.status,
            })
        }
    }, [vehicle, form])

    async function onSubmit(data: VehicleFormValues) {
        setIsLoading(true)

        try {
            await Axios.post("/api/v1/vehicle/update", data)

            toast({
                title: "Vehicle updated",
                description: `${data.name || "Vehicle"} has been updated successfully.`,
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating vehicle:", error)
            toast({
                title: "Error",
                description: "Failed to update vehicle. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Update Vehicle</DialogTitle>
                    <DialogDescription>Update the selected vehicle’s details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Hidden ID field */}
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem className="hidden">
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="E.g. Shuttle A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="plate_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>License Plate (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABC-1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="driver_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Driver Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Driver name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="IN_USE">In Use</SelectItem>
                                            <SelectItem value="RESERVED">Reserved</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Vehicle"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
