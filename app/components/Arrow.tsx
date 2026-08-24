export function Arrow({ direction = "diagonal" }: { direction?: "right" | "diagonal" }) {
  return (
    <svg
      aria-hidden="true"
      className="arrowIcon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {direction === "diagonal" ? (
        <path d="M5 19 19 5m0 0H8m11 0v11" />
      ) : (
        <path d="M3 12h18m0 0-6-6m6 6-6 6" />
      )}
    </svg>
  );
}
