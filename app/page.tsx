import Image from "next/image";
import { MailingListForm } from "./components/MailingListForm";

function OrbitField() {
  return (
    <svg className="orbitField" viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className="orbitLines">
        <ellipse cx="126" cy="310" rx="430" ry="150" transform="rotate(-21 126 310)" />
        <path d="M-90 465C250 357 457 147 390-82" />
        <path d="M1112-95c94 264 274 330 578 158" />
        <path d="M1065 1120c272-245 413-441 604-615" />
        <path d="M-80 761c153 401 409 351 522 247" />
      </g>
      <g className="orbitNodes">
        <circle cx="165" cy="196" r="5" />
        <circle cx="387" cy="171" r="4" />
        <circle cx="230" cy="300" r="5" className="nodeAccent" />
        <circle cx="1265" cy="142" r="5" />
        <circle cx="1391" cy="223" r="5" className="nodeSolid" />
        <circle cx="1475" cy="816" r="5" className="nodeSolid" />
        <circle cx="1458" cy="837" r="5" className="nodeAccent" />
        <circle cx="1268" cy="958" r="5" />
        <circle cx="184" cy="965" r="5" className="nodeAccent" />
        <circle cx="337" cy="1010" r="5" />
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <main className="comingSoon">
      <OrbitField />
      <div className="gridFragment gridFragmentLeft" aria-hidden="true" />
      <div className="gridFragment gridFragmentRight" aria-hidden="true" />

      <section className="brandStage" aria-labelledby="coming-soon-title">
        <Image
          className="i4iLogo"
          src="/i4i-centre-logo-tet.png"
          alt="I4I — Innovation for Impact Centre"
          width={1536}
          height={1024}
          priority
          unoptimized
        />
        <div className="launchZone">
          <div className="launchMessage">
            <span className="launchSignal" aria-hidden="true" />
            <h1 id="coming-soon-title">Coming soon.</h1>
          </div>
          <MailingListForm />
        </div>
      </section>

      <footer className="endorsement">
        <Image src="/tet-logo.png" alt="TET Education Group logo" width={400} height={400} />
        <p>An initiative of TET Education Group.</p>
      </footer>
    </main>
  );
}
