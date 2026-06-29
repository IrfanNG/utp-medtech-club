import { useEffect } from "react";
import { useHashRoute, useReveal } from "./shared";
import About, { ProgramDetail } from "./About";
import Contact from "./Contact";
import Portfolio, { ProjectDetail } from "./Portfolio";
import Home from "./Home";
import { AdminApp } from "./admin/AdminApp";
import { PreviewPage } from "./admin/PreviewPage";
import type { PageKey } from "./cms/types";

export default function App() {
  const route = useHashRoute();
  useReveal(route.path + route.anchor);

  useEffect(() => {
    if (route.anchor && !route.path.startsWith("/admin")) {
      const el = document.getElementById(route.anchor);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }, [route.path, route.anchor]);

  /* Preview route — renders public page with draft content, no admin chrome */
  if (route.path.startsWith("/admin/preview/")) {
    const pageKey = route.path.replace("/admin/preview/", "") as PageKey;
    if (["landing", "about", "services", "contact"].includes(pageKey)) {
      return <PreviewPage pageKey={pageKey} />;
    }
  }

  if (route.path.startsWith("/admin")) {
    return <AdminApp path={route.path} />;
  }

  if (route.path.startsWith("/about/program/")) {
    const slug = route.path.replace("/about/program/", "");
    return <ProgramDetail slug={decodeURIComponent(slug)} />;
  }
  if (route.path === "/about") {
    return <About />;
  }
  if (route.path === "/contact") {
    return <Contact />;
  }
  if (route.path.startsWith("/portfolio/project/")) {
    const slug = route.path.replace("/portfolio/project/", "");
    return <ProjectDetail slug={decodeURIComponent(slug)} />;
  }
  if (route.path === "/portfolio") {
    return <Portfolio />;
  }
  return <Home />;
}

export { Home, About, Contact, Portfolio };