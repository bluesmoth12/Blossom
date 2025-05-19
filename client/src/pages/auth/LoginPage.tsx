import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await loginUser({
        username: data.username,
        password: data.password,
      });
      
      toast({
        title: "Login successful",
        description: "Welcome to Blossom!",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full mb-4 bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-primary">
              <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.2 7.87-5.5 9.89a4.71 4.71 0 0 1-7 0C5.2 18.87 3 15.17 3 11a9 9 0 0 1 9-9z"></path>
              <path d="M7.5 14.5s1.5 2 4.5 2 4.5-2 4.5-2"></path>
              <path d="M7 10.5A.5.5 0 0 1 7.5 10a.5.5 0 0 1 .5.5"></path>
              <path d="M16 10.5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5"></path>
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">Blossom</h1>
          <p className="text-neutral-dark">Your skin journey companion</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your@email.com"
                      {...field}
                      className="px-4 py-3 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="px-4 py-3 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="remember-me"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-neutral-dark cursor-pointer" htmlFor="remember-me">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-neutral-dark">
            Don't have an account?
            <Button 
              variant="link" 
              className="font-medium text-primary hover:text-primary-dark ml-1 p-0"
              onClick={() => navigate("/auth/signup")}
            >
              Sign Up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
