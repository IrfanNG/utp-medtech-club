import { useEffect } from "react";
import { useHashRoute, useReveal } from "./shared";
import About from "./About";
import Contact from "./Contact";
import Portfolio from "./Portfolio";
import Home from "./Home";

export default function App() {
  const route = useHashRoute();
  useReveal(route.path + route.anchor);

  useEffect(() => {
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }, [route.path, route.anchor]);

  if (route.path === "/about") {
    return <About />;
  }
  if (route.path === "/contact") {
    return <Contact />;
  }
  if (route.path === "/portfolio") {
    return <Portfolio />;
  }
  return <Home />;
}

export { Home, About, Contact, Portfolio };