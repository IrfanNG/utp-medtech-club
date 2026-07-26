import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useHashRoute, useReveal } from "./shared";
import About, { ProgramDetail } from "./About";
import Contact from "./Contact";
import Portfolio, { ProjectDetail } from "./Portfolio";
import Home from "./Home";
import { AdminApp } from "./admin/AdminApp";
import { PreviewPage } from "./admin/PreviewPage";
import PreloaderIntro from "./components/PreloaderIntro";
import type { PageKey } from "./cms/types";

export default function App() {
  const route = useHashRoute();
  useReveal(route.path + route.anchor);
  const [revealReady, setRevealReady] = useState(false);

  const isAdminRoute = route.path.startsWith("/admin");

  useEffect(() => {
    if (route.anchor && !isAdminRoute) {
      const el = document.getElementById(route.anchor);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }, [route.path, route.anchor, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) setRevealReady(true);
  }, [isAdminRoute]);

  const onRevealReady = useCallback(() => {
    setRevealReady(true);
  }, []);

  let page: ReactNode;

  /* Preview route — renders public page with draft content, no admin chrome */
  if (route.path.startsWith("/admin/preview/")) {
    const pageKey = route.path.replace("/admin/preview/", "") as PageKey;
    if (["landing", "about", "services", "contact"].includes(pageKey)) {
      page = <PreviewPage pageKey={pageKey} />;
    }
  } else if (route.path.startsWith("/admin")) {
    page = <AdminApp path={route.path} />;
  } else if (route.path.startsWith("/about/program/")) {
    const slug = route.path.replace("/about/program/", "");
    page = <ProgramDetail slug={decodeURIComponent(slug)} />;
  } else if (route.path === "/about") {
    page = <About />;
  } else if (route.path === "/contact") {
    page = <Contact />;
  } else if (route.path.startsWith("/portfolio/project/")) {
    const slug = route.path.replace("/portfolio/project/", "");
    page = <ProjectDetail slug={decodeURIComponent(slug)} />;
  } else if (route.path === "/portfolio") {
    page = <Portfolio />;
  } else {
    page = <Home />;
  }

  return (
    <>
      <PreloaderIntro onRevealReady={onRevealReady} />
      {(revealReady || isAdminRoute) && page}
    </>
  );
}

export { Home, About, Contact, Portfolio };