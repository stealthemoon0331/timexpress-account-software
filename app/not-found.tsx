"use client";

export default function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // background: '#20faf6',
        color: '#fff',
      }}
    >
      <h1 className="text-5xl text-red-700 font-semibold mb-10">
        404 Page Not Found
      </h1>
      <p className="text-xl text-red-500">The page you are looking for does not exist.</p>
    </div>
  );
}
