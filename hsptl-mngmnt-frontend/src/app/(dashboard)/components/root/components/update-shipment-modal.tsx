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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

const shipmentSchema = z.object({
    id: z.string().min(1, { message: "Shipment ID is required" }),
    destination: z.string().min(1, { message: "Destination is required" }),
    start: z.string().min(1, { message: "Start date is required" }),
    end: z.string().min(1, { message: "End date is required" }),
    description: z.string().optional(),
})

type ShipmentFormValues = z.infer<typeof shipmentSchema>

interface Shipment {
    id: string
    destination: string
    start: string
    end: string
    description: string
    vehicle_id?: string
    orders_id?: string[]
}

interface UpdateShipmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    shipment: Shipment | null
}

export function UpdateShipmentModal({ isOpen, onClose, onSuccess, shipment }: UpdateShipmentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<ShipmentFormValues>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            id: "",
            destination: "",
            start: "",
            end: "",
            description: "",
        },
    })

    // Update form when shipment changes
    useEffect(() => {
        if (shipment) {
            // Format dates for the date input
            const formatDate = (dateString: string) => {
                if (!dateString) return ""
                const date = new Date(dateString)
                return date.toISOString().split("T")[0]
            }

            form.reset({
                id: shipment.id,
                destination: shipment.destination,
                start: formatDate(shipment.start),
                end: formatDate(shipment.end),
                description: shipment.description || "",
            })
        }
    }, [shipment, form])

    async function onSubmit(data: ShipmentFormValues) {
        setIsLoading(true)

        try {
            await Axios.post("/api/v1/shipment/update", data)

            toast({
                title: "Shipment updated",
                description: "Shipment has been updated successfully.",
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating shipment:", error)
            toast({
                title: "Error",
                description: "Failed to update shipment. Please try again.",
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
                    <DialogTitle>Update Shipment</DialogTitle>
                    <DialogDescription>Update the shipment information. Fill in all the required fields.</DialogDescription>
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
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter shipment description" {...field} />
                                    </FormControl>
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
                                    "Update Shipment"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

