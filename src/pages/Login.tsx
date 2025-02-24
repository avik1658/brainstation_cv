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
import {useAxios} from "@/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import  { AxiosError } from 'axios';


const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const axiosInstance = useAxios();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const removeErrorMsg = () => {
    setErrorMsg(null);
  }

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axiosInstance.post("/api/token/", data);
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      const role = response.data.is_admin ? "admin" : "user";
      
      console.log("Login successful:", response.data);
      console.log("Access Token:", accessToken);
      console.log("Role:", role);


      localStorage.setItem("localAccessToken", accessToken);
      localStorage.setItem("localRefreshToken", refreshToken);
      localStorage.setItem("role", role);
  
      navigate("/home");
    } catch (error) {
    const err = error as AxiosError
      if (!err?.response) {
          setErrorMsg("No Server Response");
      } else if (err.response?.status === 401) {
          setErrorMsg("Wrong Username or Password");
      } else {
          setErrorMsg("Login Failed");
      }  
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
                    <Input placeholder="Enter your username" {...field}
                    onChange={(e) => {
                      field.onChange(e); 
                      removeErrorMsg();
                    }} />
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
                    <Input type="password" placeholder="Enter your password" {...field}
                    onChange={(e) => {
                      field.onChange(e); 
                      removeErrorMsg();
                    }}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {errorMsg && <p className="text-red-500 text-center font-semibold mb-4">{errorMsg}</p>}
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
