import Landing from "./pages/Landing";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";

const path = window.location.pathname;

export default function App() {
  if (path === "/teacher") return <Teacher />;
  if (path === "/student") return <Student />;
  return <Landing />;
}
