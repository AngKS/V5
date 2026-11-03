"use client";
import "./terminal.css";
import { TerminalText } from "./terminal-text";
import { Icon } from "@/components/icon";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  const privacy = useRef<HTMLDivElement>(null);
  const privacyButton = useRef<HTMLButtonElement>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) setPrivacyOpen(false);
    if (!privacyOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !privacy.current?.contains(event.target)
      ) {
        setPrivacyOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss, true);
    return () => document.removeEventListener("pointerdown", dismiss, true);
  }, [privacyOpen, isOpen]);
  const input = useRef<HTMLInputElement>(null);
  const [caretX, setCaretX] = useState<number | null>(0);
  const measureCaret = useCallback(() => {
    const element = input.current;
    if (!element || element.selectionStart !== element.selectionEnd) {
      setCaretX(null);
      return;
    }
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const style = getComputedStyle(element);
    context.font = style.font;
    const x =
      context.measureText(element.value.slice(0, element.selectionStart ?? 0))
        .width - element.scrollLeft;
    setCaretX(Math.max(0, Math.min(element.clientWidth - 3, x)));
  }, []);
  const output = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const follow = useRef(true);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const [mobile, setMobile] = useState(false);
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
    measureCaret();
    const element = input.current;
    if (!element) return;
    const observer = new ResizeObserver(measureCaret);
    observer.observe(element);
    return () => observer.disconnect();
  }, [command, booting, measureCaret]);

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
      const isMobile = window.matchMedia("(max-width: 700px)").matches;
      setMobile(isMobile);
      dialog.current?.style.setProperty(
        "--terminal-height",
        `${isMobile ? height : height * 0.88}px`,
      );
      dialog.current?.style.setProperty(
        "--terminal-center",
        `${(viewport?.offsetTop ?? 0) + height / 2}px`,
      );
    };
    resize();
    window.addEventListener("resize", resize);
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    return () => {
      window.removeEventListener("resize", resize);
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

  const shellHeight = mobile
    ? viewportHeight
    : Math.min(760, viewportHeight * 0.88);
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
        if (privacyOpen) {
          setPrivacyOpen(false);
          privacyButton.current?.focus();
        } else onClose();
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
              <TerminalText text={BOOT.slice(0, bootLength)} />
              {booting && (
                <span className="terminal-cursor" aria-hidden="true">
                  ▊
                </span>
              )}
            </pre>
          )}
          {entries.map((entry, i) => (
            <section
              className="terminal-entry"
              key={i}
              aria-label={`Command ${i + 1}: ${entry.command}`}
              data-channel={/^qn\s/i.test(entry.command) ? "uplink" : "local"}
            >
              <p className="terminal-echo">
                <span aria-hidden="true">visitor@angks:~$ </span>
                <TerminalText text={entry.command} />
              </p>
              <div className="terminal-response">
                <span className="terminal-response-label">
                  {/^qn\s/i.test(entry.command) ? "AI uplink" : "Local output"}
                </span>
                <pre>
                  <TerminalText
                    text={
                      entry.text ||
                      (busy && i === entries.length - 1
                        ? "[Establishing uplink ...]"
                        : "")
                    }
                  />
                </pre>
                {entry.href && (
                  <a href={entry.href} target="_blank" rel="noreferrer">
                    Open resume.pdf <Icon name="arrow-up-right" />
                  </a>
                )}
              </div>
            </section>
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
              <div className="terminal-input-wrap">
                <input
                  ref={input}
                  onSelect={measureCaret}
                  onScroll={measureCaret}
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
                {caretX !== null && !busy && (
                  <span
                    className="terminal-block-caret"
                    aria-hidden="true"
                    style={{ transform: `translateX(${caretX}px)` }}
                  />
                )}
              </div>
              <div className="terminal-info" ref={privacy}>
                <button
                  ref={privacyButton}
                  type="button"
                  className="terminal-info-button"
                  aria-label="About privacy and AI answers"
                  aria-expanded={privacyOpen}
                  aria-controls="terminal-privacy"
                  onClick={() => setPrivacyOpen((value) => !value)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v6M12 7v1" />
                  </svg>
                </button>
                {privacyOpen && (
                  <div
                    id="terminal-privacy"
                    className="terminal-privacy-popover"
                    role="note"
                  >
                    <strong>Privacy &amp; AI</strong>
                    <p>
                      Local commands stay here. <strong>qn</strong> sends your
                      question + public bio to OpenAI. AI answers may be
                      imperfect.
                    </p>
                  </div>
                )}
              </div>
              {busy ? (
                <button
                  type="button"
                  onClick={() => controller.current?.abort()}
                >
                  STOP
                </button>
              ) : (
                <button
                  type="submit"
                  className="terminal-send"
                  aria-label="Send command"
                  title="Send command"
                  disabled={!command.trim()}
                >
                  <Icon name="send" />
                </button>
              )}
            </form>
          )}
        </div>
        <div className="terminal-sr" role="status" aria-live="polite">
          {announcement}
        </div>
      </motion.div>
    </dialog>
  );
}
