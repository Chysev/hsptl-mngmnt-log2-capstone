"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Axios from "@/lib/Axios"
import { useToast } from "@/components/ui/use-toast"


interface DeleteShipmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    id: string
    name: string
}

export function DeleteShipmentModal({ isOpen, onClose, onSuccess, id, name }: DeleteShipmentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleDelete() {
        setIsLoading(true)

        try {
            await Axios.post(`/api/v1/shipment/delete/${id}`)

            toast({
                title: "Shipment deleted",
                description: "Shipment has been deleted successfully.",
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting shipment:", error)
            toast({
                title: "Error",
                description: "Failed to delete shipment. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete <span className="font-medium">{name}</span>. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

