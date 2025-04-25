"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const SignIn = ({ className, children }: Props) => {
  return (
    <Button className={className} onClick={signIn}>
      {children}
    </Button>
  );
};

export default SignIn;
