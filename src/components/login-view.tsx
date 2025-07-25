"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.5 69.5c-24.3-23.6-58.2-38.3-98.4-38.3-87.3 0-158.3 70.4-158.3 157.1s71 157.1 158.3 157.1c97.1 0 134.3-64.8 140.8-98.5H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

export function LoginView() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="container flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                    Your Digital Workshop Awaits
                </h1>
                <p className="text-muted-foreground">
                    Sign in to manage your craft projects, track progress, and bring your ideas to life.
                </p>
            </div>
            <Button variant="outline" type="button" onClick={signInWithGoogle} size="lg">
                <GoogleIcon />
                Sign In with Google
            </Button>
            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    </div>
  );
}
