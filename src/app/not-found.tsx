import Link from "next/link";
import { DiscoveryAward, Discoveries } from "@/components/discoveries";
export default function NotFound() {
  return (
    <main className="not-detected wrap">
      <DiscoveryAward id="lost" />
      <Link className="wordmark" href="/">
        ANGKS<span>✳</span>
      </Link>
      <div className="detector-field" aria-hidden="true">
        <span>404</span>
        <div className="searching-box">
          <i />
          <i />
          <i />
          <i />
          <b>SEARCHING...</b>
        </div>
        <small>CONFIDENCE: 0.00 / OBJECT: UNKNOWN</small>
      </div>
      <div className="section-label">OUTSIDE THE TRAINING DATA</div>
      <h1>
        OBJECT NOT
        <br />
        DETECTED<span className="accent">.</span>
      </h1>
      <p>
        Even a good model loses track sometimes.
        <br />
        This page isn’t here. Your next discovery might be.
      </p>
      <Link href="/" className="text-link">
        BACK TO KNOWN TERRITORY ↗
      </Link>
      <Discoveries />
    </main>
  );
}
