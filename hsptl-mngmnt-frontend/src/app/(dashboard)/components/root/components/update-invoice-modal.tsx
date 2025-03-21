"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, DollarSign } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

// Define the form schema
const updateInvoiceFormSchema = z.object({
    id: z.string().min(1, { message: "Invoice ID is required" }),
    amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
    status: z.string().min(1, { message: "Status is required" }),
    issueDate: z.date({
        required_error: "Issue date is required",
    }),
})

type UpdateInvoiceFormValues = z.infer<typeof updateInvoiceFormSchema>

interface Invoice {
    id: string
    amount: number
    status: string
    issueDate: string
    account_id?: string
    createdAt?: string
    updatedAt?: string
}

interface UpdateInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    invoice: Invoice | null
}

export function UpdateInvoiceModal({ isOpen, onClose, onSuccess, invoice }: UpdateInvoiceModalProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize the form
    const form = useForm<UpdateInvoiceFormValues>({
        resolver: zodResolver(updateInvoiceFormSchema),
        defaultValues: {
            id: "",
            amount: 0,
            status: "",
            issueDate: new Date(),
        },
    })

    // Update form values when invoice changes
    useEffect(() => {
        if (invoice) {
            form.reset({
                id: invoice.id,
                amount: invoice.amount,
                status: invoice.status,
                issueDate: new Date(invoice.issueDate),
            })
        }
    }, [invoice, form])

    // Handle form submission
    async function onSubmit(data: UpdateInvoiceFormValues) {
        setIsSubmitting(true)
        try {
            await Axios.put("/api/v1/invoice/update", data)
            toast({
                title: "Invoice updated",
                description: "The invoice has been updated successfully.",
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error updating invoice:", error)
            toast({
                title: "Error",
                description: "Failed to update invoice. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Invoice</DialogTitle>
                    <DialogDescription>Update the invoice details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Invoice ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.01" min="0.01" className="pl-8" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>Update the invoice amount</FormDescription>
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
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Update the current status of the invoice</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="issueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Issue Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Update the date when the invoice was issued</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update Invoice"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

