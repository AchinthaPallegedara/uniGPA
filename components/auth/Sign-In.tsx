"use client";
import { signIn } from "@/lib/auth-client";
import React from "react";
import { Button } from "../ui/button";

const SignIn = () => {
  return (
    <form action={() => signIn()}>
      <Button type="submit">Sign in</Button>
    </form>
  );
};

export default SignIn;
