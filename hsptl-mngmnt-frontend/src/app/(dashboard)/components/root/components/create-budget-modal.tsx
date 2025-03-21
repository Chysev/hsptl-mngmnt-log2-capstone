import { useState } from "react"
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

const budgetRequestSchema = z.object({
    date: z.date(),
    department: z.string().min(1, { message: "Department is required" }),
    amount: z.coerce.number().min(0.01, { message: "Amount must be greater than 0" }),
    budgetType: z.string().min(1, { message: "Budget type is required" }),
    description: z.string().min(1, { message: "Description is required" }),
})

export type BudgetRequestFormValues = z.infer<typeof budgetRequestSchema>

interface CreateBudgetRequestModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateBudgetRequestModal({ isOpen, onClose, onSuccess }: CreateBudgetRequestModalProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<BudgetRequestFormValues>({
        resolver: zodResolver(budgetRequestSchema),
        defaultValues: {
            date: new Date(),
            department: "",
            amount: 0,
            budgetType: "",
            description: "",
        },
    })

    async function onSubmit(data: BudgetRequestFormValues) {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                date: data.date.getTime(),
                status: "Pending",
            }
            await Axios.post("https://backend-finance.nodadogenhospital.com/budget/add-request", payload)
            toast({ title: "Budget request created successfully" })
            form.reset()
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error creating budget request:", error)
            toast({
                title: "Error",
                description: "Failed to create budget request. Please try again.",
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
                    <DialogTitle>Create Budget Request</DialogTitle>
                    <DialogDescription>Fill in the details below to create a new budget request.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter department name" {...field} />
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="budgetType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select budget type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Medical Equipments">Medical Equipments</SelectItem>
                                            <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Describe the purpose" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
