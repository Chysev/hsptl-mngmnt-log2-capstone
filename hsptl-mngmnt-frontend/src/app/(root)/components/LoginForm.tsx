"use client";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { SetTokenAction } from "@/app/actions";
import { useToast } from "@/components/ui/use-toast";
import { useShowPasswordState, useLoadingState } from "@/state/states";

const LoginForm = () => {
  const router = useRouter();
  const { toast } = useToast();

  const { data: showPassword, setData: setShowPassword } =
    useShowPasswordState();
  const { data: isLoading, setData: setIsLoading } = useLoadingState();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    try {
      const response = await SetTokenAction(values);

      if (response?.success === true) {
        toast({ title: "Auth", description: "Logged in!" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
        return;
      }

      if (response?.step === "2fa") {
        localStorage.setItem("tempToken", response.tempToken);
        router.push("/2fa");
        return;
      }

      if (response?.success === false) {
        toast({ title: "Auth", description: `${response?.message}` });
      }
    } catch (error) {
      toast({ title: "Auth", description: "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      <div className="flex flex-col items-center space-y-6 max-w-md w-full">
        <Image
          src="/NGH_NEW_LOGO.jpg"
          alt="Logo"
          width={180}
          height={180}
          className="rounded-full mb-2"
        />

        <Card className="w-full shadow-lg bg-transparent bg-opacity-95 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardHeader className="items-center text-center">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Authorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@example.com"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <span
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  disabled={isLoading as boolean}
                  className="w-full"
                  type="submit"
                >
                  Login
                </Button>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="text-red-100">Don&apos;t have an account?</span>
                  <Link href="/register" className="text-red-200 hover:underline">
                    Register
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
