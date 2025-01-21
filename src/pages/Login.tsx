import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/axios";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { accessTokenAtom,refreshTokenAtom} from "@/store/tokenStore";
import { useNavigate } from "react-router-dom"; 
import Cookies from "js-cookie";

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const setAccessToken = useSetAtom(accessTokenAtom);  // Using Jotai to set the token
  const setRefreshToken = useSetAtom(refreshTokenAtom);  
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null); 
    try {
      const response = await axiosInstance.post("/api/v1/token/", data);
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      
      // Save token in Jotai state
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      console.log("Login successful:", response.data);
      console.log("Access Token:", accessToken);

      // Save token in cookies
      Cookies.set("accessToken", accessToken, { expires: 1 }); // Expires in 1 day
      Cookies.set("refreshToken", refreshToken, { expires: 7 }); // Expires in 7 days
  
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="bg-[url('/images/brainstation.jpg')] bg-cover bg-center h-screen w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">CV Site</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
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
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-center font-semibold mb-4">{error}</p>}
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
        <Button className="w-full mt-4">
          <img src="/icons/microsoft.png" alt="Microsoft logo" className="inline-block w-6 h-6 mr-2" />
          Login with Microsoft
        </Button>
      </div>
    </div>
  );
}
