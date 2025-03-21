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

interface DeleteVehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    id: string
    vehicleId: string
}

export function DeleteVehicleModal({ isOpen, onClose, onSuccess, id, vehicleId }: DeleteVehicleModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleDelete() {
        setIsLoading(true)

        try {
            await Axios.post(`/api/v1/vehicle/delete/${id}`)

            toast({
                title: "Vehicle deleted",
                description: `${vehicleId} has been deleted successfully.`,
            })

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Error deleting vehicle:", error)
            toast({
                title: "Error",
                description: "Failed to delete vehicle. Please try again.",
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
                        This will permanently delete vehicle <span className="font-medium">{vehicleId}</span>. This action cannot be
                        undone.
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

