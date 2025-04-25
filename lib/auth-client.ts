import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";
import { redirect } from "next/navigation";
export const authClient = createAuthClient({
  plugins: [
    oneTapClient({
      clientId:
        "1000398005308-l7lsevgitk3q1tg6e3am2p6jbtg4jedk.apps.googleusercontent.com",
      // Optional client configuration:
      autoSelect: true,
      cancelOnTapOutside: true,
      context: "signin",
      additionalOptions: {
        // Any extra options for the Google initialize method
      },
      // Configure prompt behavior and exponential backoff:
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
    }),
  ],
});

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};

export const signOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        redirect("/"); // Redirect to the home page after sign out
      },
    },
  });
};

export const getSessionData = async () => {
  const session = await authClient.getSession();
  return session.data;
};

export const signInOneTap = async () => {
  await authClient.oneTap();
};
