export default function Landing() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Welcome to the Live Polling System</h2>

      <div style={{ marginTop: "40px" }}>
        <a href="/student">
          <button>I’m a Student</button>
        </a>

        <a href="/teacher" style={{ marginLeft: "20px" }}>
          <button>I’m a Teacher</button>
        </a>
      </div>
    </div>
  );
}
