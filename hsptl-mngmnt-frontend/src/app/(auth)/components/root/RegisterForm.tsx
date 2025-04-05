"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { z } from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/validators";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Register } from "@/app/api/auth/index.c";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoadingState, useShowPasswordState } from "@/state/states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";



const RegisterForm = () => {
  const { toast } = useToast();
  const { data: showPassword, setData: setShowPassword } =
    useShowPasswordState();
  const { data: isLoading, setData: setIsLoading } = useLoadingState();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(
      RegisterSchema.extend({
        role: z.enum(["STAFF", "VENDOR", "ADMIN"]),
        document: z.string().url().optional(),
        contract: z.string().url().optional(),
      })
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STAFF",
      document: "",
      contract: "",
    },
  });

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setIsLoading(true);

    try {
      const response = await Register(values);

      toast({
        title: "Auth",
        description: response.data.message,
      });
    } catch (error) {
      toast({
        title: "Auth",
        description: "Something went wrong",
      });
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
          className="mb-2 rounded-full"
        />

        <Card className="w-full shadow-lg bg-transparent bg-opacity-95 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardHeader className="items-center text-center">
                <CardTitle className="text-2xl">Register</CardTitle>
                <CardDescription>Authorization</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} />
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
                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">STAFF</SelectItem>
                            <SelectItem value="VENDOR">VENDOR</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Document */}
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/document.pdf"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Contract */}
                <FormField
                  control={form.control}
                  name="contract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/contract.pdf"
                          {...field}
                        />
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
                  Register
                </Button>
                <div className="flex justify-center gap-2 text-sm">
                  <span>Already have an account?</span>
                  <Link href="/" className="text-green-600 hover:underline">
                    Login
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

export default RegisterForm;
