"use client";

import { FormEvent, useState } from "react";

type FormState = {
  kind: "idle" | "loading" | "success" | "error";
  message?: string;
  previewUrl?: string;
};

export function MailingListForm() {
  const [state, setState] = useState<FormState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website") }),
      });
      const result = (await response.json()) as { message?: string; previewUrl?: string };

      if (!response.ok) throw new Error(result.message || "Please try again.");

      form.reset();
      setState({
        kind: "success",
        message: result.message || "Check your inbox to confirm your email.",
        previewUrl: result.previewUrl,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <form className="launchSignup" onSubmit={handleSubmit} noValidate>
      <label htmlFor="launch-email">Notify me of launch:</label>
      <div className="signupControls">
        <input
          id="launch-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email address"
          required
          maxLength={254}
        />
        <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button type="submit" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "JOINING…" : "JOIN OUR MAILING LIST"}
        </button>
      </div>
      <div className={`formStatus ${state.kind}`} role="status" aria-live="polite">
        {state.message}
        {state.previewUrl && (
          <>
            {" "}
            <a href={state.previewUrl}>Preview confirmation</a>
          </>
        )}
      </div>
    </form>
  );
}
