import SignIn from "@/components/auth/Sign-In";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return (
      <div>
        <h1 className="text-3xl font-bold underline">Not Authenticated</h1>
        <SignIn />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold underline">{session?.user.name}</h1>
      <Link href={`/dashboard/${session.user.id}`}>Dashboard</Link>
      {/* <Button onClick={signIn}>Google</Button> */}
      {/* <Button onClick={signOut}>Sign Out</Button> */}
    </div>
  );
}
