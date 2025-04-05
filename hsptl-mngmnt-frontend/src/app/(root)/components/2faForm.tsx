"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import jsCookie from "js-cookie"

const TwoFactorSchema = z.object({
    code: z.string().min(6, "Enter the 6-digit code"),
});

const TwoFactorForm = () => {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof TwoFactorSchema>>({
        resolver: zodResolver(TwoFactorSchema),
        defaultValues: {
            code: "",
        },
    });

    const onSubmit = async (data: { code: string }) => {
        const tempToken = localStorage.getItem("tempToken");


        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/auth/verify2fa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: data.code, token: tempToken }),
            });

            const result = await res.json();
            console.log(result)
            if (result?.data?.sessionToken) {
                jsCookie.set("sessionToken", result.data.sessionToken, {
                    secure: true,
                    sameSite: "strict",
                    path: "/",
                });

                toast({ title: "2FA", description: "Verified!" });
                if (result.data.role === "VENDOR") {
                    router.push("/dashboard");
                } else if (result.data.role === "STAFF") {
                    router.push("/dashboard/orders");

                }
            } else {
                toast({
                    title: "2FA",
                    description: result.message || "Invalid code",
                });
            }


        } catch (error) {
            toast({ title: "2FA", description: "Something went wrong" });
        }
    };


    return (
        <Card className="min-h-screeng m-auto shadow-slate-100 shadow-sm rounded-lg p-5 max-w-[500px] w-full">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <CardHeader className="items-center">
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        {...form.register("code")}
                    />
                </CardContent>
                <CardFooter>
                    <Button className="w-full text-lg" type="submit">
                        Verify
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default TwoFactorForm;
