"use client";
import { Icon } from "@/components/icon";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BOOT, MAX_QUESTION_LENGTH, runCommand } from "@/lib/terminal";

type Entry = { command: string; text: string; href?: string };

export default function SecretTerminal({
  onClose,
  isOpen,
  pull,
}: {
  onClose: () => void;
  isOpen: boolean;
  pull: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const outsidePress = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const follow = useRef(true);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const [settled, setSettled] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === "undefined"
      ? 800
      : (window.visualViewport?.height ?? window.innerHeight),
  );
  const [command, setCommand] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [bootLength, setBootLength] = useState(0);
  const [showBoot, setShowBoot] = useState(true);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const reduced = useReducedMotion();
  const booting = bootLength < BOOT.length;

  useEffect(() => {
    if (!isOpen) return;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      controller.current?.abort();
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      const height = viewport?.height ?? window.innerHeight;
      setViewportHeight(height);
      dialog.current?.style.setProperty(
        "--terminal-height",
        `${height * 0.88}px`,
      );
      dialog.current?.style.setProperty(
        "--terminal-center",
        `${(viewport?.offsetTop ?? 0) + height / 2}px`,
      );
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || (!settled && !reduced)) return;
    if (reduced) {
      setBootLength(BOOT.length);
      return;
    }
    if (!booting) return;
    const timer = setInterval(
      () => setBootLength((n) => Math.min(BOOT.length, n + 9)),
      24,
    );
    return () => clearInterval(timer);
  }, [reduced, booting, isOpen, settled]);

  useEffect(() => {
    if (!booting && isOpen) {
      setAnnouncement("Terminal ready. Type help for commands.");
      // Avoid opening a mobile keyboard before the visitor asks to type.
      if (window.matchMedia("(pointer: fine)").matches) input.current?.focus();
    }
  }, [booting, isOpen]);

  useEffect(() => {
    if (follow.current && output.current)
      output.current.scrollTop = output.current.scrollHeight;
  }, [entries, bootLength]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || booting || !command.trim()) return;
    const raw = command.trim();
    setCommand("");
    history.current = [...history.current, raw].slice(-40);
    historyIndex.current = history.current.length;
    follow.current = true;
    const result = runCommand(raw);
    if (result.kind === "exit") {
      onClose();
      return;
    }
    if (result.kind === "clear") {
      setEntries([]);
      setShowBoot(false);
      return;
    }
    if (result.kind === "file") {
      setBusy(true);
      const abort = new AbortController();
      controller.current = abort;
      let text: string;
      try {
        const response = await fetch(`/files/${result.name}`, {
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(8000)]),
        });
        if (!response.ok) throw new Error("File unavailable");
        text = await response.text();
      } catch {
        text = abort.signal.aborted
          ? "[File read stopped.]"
          : "File unavailable. Try help for the built-in manual.";
      } finally {
        setBusy(false);
        controller.current = null;
      }
      setEntries((items) => [...items.slice(-39), { command: raw, text }]);
      setAnnouncement(text);
      return;
    }
    if (result.kind === "text" || result.kind === "resume") {
      setEntries((items) => [
        ...items.slice(-39),
        {
          command: raw,
          text: result.text,
          ...(result.kind === "resume" ? { href: result.href } : {}),
        },
      ]);
      setAnnouncement(result.text);
      return;
    }
    setEntries((items) => [...items.slice(-39), { command: raw, text: "" }]);
    setBusy(true);
    setAnnouncement("Connecting to the Q&A uplink.");
    const abort = new AbortController();
    controller.current = abort;
    let answer = "";
    const update = () =>
      setEntries((items) =>
        items.map((item, i) =>
          i === items.length - 1 ? { ...item, text: answer } : item,
        ),
      );
    try {
      const response = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: result.question }),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(30_000)]),
      });
      if (!response.ok) {
        answer = await response.text();
        update();
        return;
      }
      if (!response.body) throw new Error("No stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        update();
      }
      answer += decoder.decode();
      if (!answer.trim())
        answer = "No reply from the uplink. Please try again.";
      update();
    } catch {
      answer += abort.signal.aborted
        ? "\n[Transmission stopped.]"
        : "\n[Connection lost. Please try again.]";
      update();
    } finally {
      setBusy(false);
      setAnnouncement(answer);
      controller.current = null;
    }
  }

  const shellHeight = Math.min(760, viewportHeight * 0.88);
  const hiddenOffset = viewportHeight / 2 + shellHeight / 2 + 18;
  const resistedPull =
    (Math.min(240, viewportHeight * 0.29) * (1 - Math.exp(-3 * pull))) /
    (1 - Math.exp(-3));
  const targetY = isOpen ? 0 : hiddenOffset - resistedPull;

  return (
    <dialog
      ref={dialog}
      className="secret-terminal"
      open={!isOpen || undefined}
      inert={!isOpen}
      aria-hidden={!isOpen}
      data-pulling={!isOpen}
      onPointerDown={(event) => {
        outsidePress.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (outsidePress.current && event.target === event.currentTarget)
          onClose();
        outsidePress.current = false;
      }}
      aria-labelledby="terminal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <motion.div
        className="terminal-shell"
        initial={{ y: reduced && isOpen ? 0 : hiddenOffset }}
        animate={{ y: targetY }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: isOpen ? 55 : 150,
                damping: isOpen ? 22 : 28,
                mass: isOpen ? 1.5 : 1.2,
              }
        }
        onAnimationComplete={() => {
          if (isOpen) setSettled(true);
        }}
      >
        <header className="terminal-bar">
          <div>
            <span className="terminal-led" aria-hidden="true" />{" "}
            <h2 id="terminal-title">ANGKS / AUXILIARY TERMINAL</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close terminal"
          >
            ESC{" "}
            <span aria-hidden="true">
              <Icon name="close" />
            </span>
          </button>
        </header>
        <div className="terminal-classification" aria-hidden="true">
          <span>UNLISTED CHANNEL · 05</span>
          <span>VISITOR DETECTED</span>
        </div>
        <div
          className="terminal-output"
          ref={output}
          tabIndex={0}
          aria-label="Terminal transcript"
          onScroll={() => {
            const el = output.current;
            if (el)
              follow.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 45;
          }}
        >
          {!isOpen && (
            <div className="terminal-pull-preview">
              <span>
                {pull > 0.7 ? "SEAL DISENGAGING ..." : "A HIDDEN CHANNEL?"}
              </span>
              <p>Keep pulling. There’s something down here.</p>
              <i style={{ transform: `scaleX(${pull})` }} />
            </div>
          )}
          {isOpen && showBoot && (
            <pre className="terminal-boot">
              {BOOT.slice(0, bootLength)}
              {booting && (
                <span className="terminal-cursor" aria-hidden="true">
                  ▊
                </span>
              )}
            </pre>
          )}
          {entries.map((entry, i) => (
            <div className="terminal-entry" key={i}>
              <p className="terminal-echo">
                <span aria-hidden="true">visitor@angks:~$ </span>
                {entry.command}
              </p>
              <pre>
                {entry.text ||
                  (busy && i === entries.length - 1
                    ? "Establishing uplink ..."
                    : "")}
              </pre>
              {entry.href && (
                <a href={entry.href} target="_blank" rel="noreferrer">
                  Open resume.pdf <Icon name="arrow-up-right" />
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="terminal-controls">
          {booting ? (
            <button
              className="terminal-skip"
              onClick={() => setBootLength(BOOT.length)}
            >
              Skip boot sequence <Icon name="enter" />
            </button>
          ) : (
            <form onSubmit={submit} className="terminal-command">
              <label htmlFor="terminal-command">
                <span aria-hidden="true">~$</span>
                <span className="terminal-sr">Terminal command</span>
              </label>
              <input
                ref={input}
                id="terminal-command"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                readOnly={busy}
                maxLength={MAX_QUESTION_LENGTH + 3}
                placeholder="Type help, or qn your question ..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="send"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "c" && busy) {
                    e.preventDefault();
                    controller.current?.abort();
                  }
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    historyIndex.current = Math.max(
                      0,
                      Math.min(
                        history.current.length,
                        historyIndex.current + (e.key === "ArrowUp" ? -1 : 1),
                      ),
                    );
                    setCommand(history.current[historyIndex.current] || "");
                  }
                }}
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => controller.current?.abort()}
                >
                  STOP
                </button>
              ) : (
                <button type="submit" disabled={!command.trim()}>
                  ENTER <Icon name="enter" />
                </button>
              )}
            </form>
          )}
          <p className="terminal-privacy">
            Local commands stay here. <strong>qn</strong> sends your question +
            public bio to OpenAI. AI answers may be imperfect.
          </p>
        </div>
        <div className="terminal-sr" role="status" aria-live="polite">
          {announcement}
        </div>
      </motion.div>
    </dialog>
  );
}
