/** Small, text-only lexer: never interprets command output or AI replies as HTML. */
export function TerminalText({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <span className="terminal-line" key={index}>
      {line
        .split(
          /(`[^`]+`|\b(?:USER_MANUAL\.md|resume\.pdf|hello\.txt)\b|^\s*(?:ls|help|man|cat|qn|clear|exit)\b|^#{1,6}\s.*$|\[[^\]]+\])/g,
        )
        .map((token, part) => {
          const kind = token.startsWith("`")
            ? "code"
            : /^(USER_MANUAL\.md|resume\.pdf|hello\.txt)$/.test(token)
              ? "file"
              : /^\s*(ls|help|man|cat|qn|clear|exit)$/.test(token)
                ? "keyword"
                : /^#{1,6}\s/.test(token)
                  ? "heading"
                  : /^\[.*\]$/.test(token)
                    ? "status"
                    : undefined;
          return kind ? (
            <span className={`terminal-token-${kind}`} key={part}>
              {token}
            </span>
          ) : (
            token
          );
        })}
      {index < lines.length - 1 ? "\n" : null}
    </span>
  ));
}
