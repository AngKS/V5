"use client";
import { Icon } from "@/components/icon";

import { useEffect, useState } from "react";
import {
  awardStamp,
  readStamps,
  STAMPS,
  STAMP_EVENT,
  STAMP_KEY,
  type StampId,
} from "@/lib/discoveries";

export function DiscoveryAward({ id }: { id: StampId }) {
  useEffect(() => {
    awardStamp(id);
  }, [id]);
  return null;
}

export function Discoveries() {
  const [collected, setCollected] = useState<StampId[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    setCollected(readStamps());
    const update = (event: Event) => {
      setCollected([...readStamps()]);
      const id = (event as CustomEvent).detail;
      const stamp = STAMPS.find((item) => item.id === id);
      if (stamp) setNotice(`Stamp collected: ${stamp.name}.`);
    };
    const storage = (event: StorageEvent) => {
      if (event.key === STAMP_KEY) update(event);
    };
    window.addEventListener(STAMP_EVENT, update);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(STAMP_EVENT, update);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return (
    <div className="discovery-desk">
      <a
        className="engine-room"
        href="https://github.com/AngKS/V5"
        target="_blank"
        rel="noreferrer"
        onClick={() => awardStamp("engine")}
      >
        <span aria-hidden="true">
          <Icon name="branch" />
        </span>{" "}
        engine room{" "}
        <span aria-hidden="true">
          <Icon name="arrow-up-right" />
        </span>
      </a>
      <details className="discovery-passport">
        <summary>
          Discovery passport{" "}
          <span>
            {collected.length} / {STAMPS.length}
          </span>
        </summary>
        <p>
          Little detours, collected. Saved in this browser—no account needed.
        </p>
        <ul>
          {STAMPS.map((stamp) => {
            const found = collected.includes(stamp.id);
            return (
              <li key={stamp.id} className={found ? "stamp found" : "stamp"}>
                <span className="stamp-symbol" aria-hidden="true">
                  {found ? <Icon name={stamp.id} /> : "?"}
                </span>
                <strong>{found ? stamp.name : "Undiscovered"}</strong>
                <span>{found ? stamp.description : "Keep exploring."}</span>
              </li>
            );
          })}
        </ul>
      </details>
      <span className="discovery-notice" role="status">
        {notice}
      </span>
    </div>
  );
}
