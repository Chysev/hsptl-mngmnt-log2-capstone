"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import Axios from "@/lib/Axios"

interface DeleteInvoiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    id: string | null
    amount: string
}

export function DeleteInvoiceModal({ isOpen, onClose, onSuccess, id, amount }: DeleteInvoiceModalProps) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!id) return

        setIsDeleting(true)
        try {
            await Axios.delete(`/api/v1/invoice/delete/${id}`)
            toast({
                title: "Invoice deleted",
                description: "The invoice has been deleted successfully.",
            })
            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting invoice:", error)
            toast({
                title: "Error",
                description: "Failed to delete invoice. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this invoice for {amount}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Invoice"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

