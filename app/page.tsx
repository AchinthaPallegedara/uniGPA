import SignIn from "@/components/auth/Sign-In";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Grid background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background"></div>
        {/* Grid overlay pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, rgba(150, 150, 150, 0.1) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(150, 150, 150, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Main content with centered hero section */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto">
            Calculate your <span className="text-primary">GPA</span> with ease
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mt-6 mx-auto">
            Track your academic progress and manage your courses all in one
            place. Simple, fast, and accurate GPA calculations.
          </p>
          {session ? (
            <div className="flex flex-col justify-center mt-10">
              <Button size="lg" variant="outline" className="my-2 mx-auto">
                Logged in as {session.user.email}
              </Button>
              <Button size="lg" asChild className="my-2 mx-auto">
                <Link href={`/dashboard/${session.user.id}`}>
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col justify-center mt-10">
              <SignIn />
            </div>
          )}
        </div>
      </div>

      {/* Footer with "Made with ❤️ by Claviq" */}
      <footer className="w-full py-4 text-center text-sm text-muted-foreground border-t bg-background/50 backdrop-blur-sm">
        Made with ❤️ by Claviq
      </footer>
    </div>
  );
}
