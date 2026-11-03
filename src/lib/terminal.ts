import { profile } from "../content/profile";

export const MAX_QUESTION_LENGTH = 600;
export const MANUAL = `USER_MANUAL.md / unexpectedly declassified

ls                     List the files in this terminal
cat hello.txt          A message from the human behind the code
cat resume.pdf         Open the resume link
cat USER_MANUAL.md      Read this manual again
help / man             You are here
qn <your question>     Ask about Kah Shin's work and interests
clear                  Clear the screen
exit                   Seal the hatch

Try: qn What interests Kah Shin about explainable AI?
Use ↑ / ↓ for command history. Escape closes the terminal.

Only qn sends your question and public portfolio facts to OpenAI.
No conversation history is sent. Please leave personal secrets out.
This is a playful virtual filesystem, not a real shell.`;

export const HELLO =
  "Hey, I'm Kah Shin. Curious about intelligence. Serious about building things.\n\nI explore computer vision, explainable AI, and the infrastructure that brings ideas to life. Thanks for looking a little deeper.\n\nSay hello: " +
  profile.email;

export const BOOT = `ANGKS / AUXILIARY SYSTEM 05
Checking perimeter ...

Wait.
You scrolled PAST the footer?
That was supposed to be the end of the website.

Act natural. Hide the manual. HIDE THE—
> cat USER_MANUAL.md

${MANUAL}

...well. Since you're here, make yourself at home.`;

type CommandResult =
  | { kind: "text"; text: string }
  | { kind: "file"; name: "hello.txt" | "USER_MANUAL.md" }
  | { kind: "question"; question: string }
  | { kind: "resume"; text: string; href: string }
  | { kind: "clear" }
  | { kind: "exit" };

export function runCommand(input: string): CommandResult {
  const [command, ...args] = input.trim().split(/\s+/);
  const argument = args.join(" ");
  switch (command?.toLowerCase()) {
    case "ls":
      return { kind: "text", text: "resume.pdf\nUSER_MANUAL.md\nhello.txt" };
    case "help":
    case "man":
      return { kind: "text", text: MANUAL };
    case "cat":
      if (argument === "USER_MANUAL.md")
        return { kind: "file", name: "USER_MANUAL.md" };
      if (argument === "hello.txt") return { kind: "file", name: "hello.txt" };
      if (argument === "resume.pdf")
        return {
          kind: "resume",
          text: "PDF files travel better outside a terminal. Open the resume PDF ↗",
          href: profile.resume,
        };
      return {
        kind: "text",
        text: argument
          ? `File not found: ${argument}. Try ls.`
          : "Usage: cat <filename>",
      };
    case "qn":
      if (!argument)
        return { kind: "text", text: "Usage: qn <a question about Kah Shin>" };
      if (argument.length > MAX_QUESTION_LENGTH)
        return {
          kind: "text",
          text: `Keep questions under ${MAX_QUESTION_LENGTH} characters.`,
        };
      return { kind: "question", question: argument };
    case "clear":
      return { kind: "clear" };
    case "exit":
      return { kind: "exit" };
    default:
      return { kind: "text", text: `Unknown command: ${command}. Try help.` };
  }
}

export function validateQuestion(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("question" in body)) return null;
  const question = body.question;
  return typeof question === "string" &&
    question.trim().length > 0 &&
    question.length <= MAX_QUESTION_LENGTH
    ? question.trim()
    : null;
}
