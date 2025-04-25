"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Logout = ({ className, children }: Props) => {
  return (
    <Button className={className} onClick={signOut}>
      {children}
    </Button>
  );
};

export default Logout;
