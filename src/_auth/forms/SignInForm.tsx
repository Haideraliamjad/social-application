import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInValidationSchema } from "@/lib/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations";

const SignInForm = () => {
  useEffect(() => {
    document.title = "snapgram | sign in to your account";
  }, []);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: signInAccount, isPending: isLoggingIn } =
    useSignInAccount();
  const form = useForm<z.infer<typeof signInValidationSchema>>({
    resolver: zodResolver(signInValidationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInValidationSchema>) {
    try {
      const session = await signInAccount(values);
      console.log(session);
      if (!session) {
        toast({
          title: "Signin Failed please try again",
        });
        return;
      }
      console.log(session);
      return navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Sign in to your account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Sign in to enjoy snapgram
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 flex flex-col gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="shad-input"
                    placeholder="email"
                    type="email"
                    {...field}
                  />
                </FormControl>
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
                    className="shad-input"
                    placeholder="password"
                    type="password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isLoggingIn ? (
              <div className="flex-center gap-2">
                <Loader />
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
          <p className="text-sm-regular text-center text-light-2 center mt-2">
            Don't have account?{" "}
            <Link className="text-primary-500 ml-1" to={"/sign-up"}>
              sign-up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignInForm;
