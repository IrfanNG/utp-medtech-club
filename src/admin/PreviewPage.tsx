import { useContext, useMemo, type ReactNode } from "react";
import { CmsContext, type CmsContextValue } from "../cms/CmsContext";
import { safeParsePageContent, type PageKey } from "../cms/pageSchemas";
import Home from "../Home";
import About from "../About";
import Contact from "../Contact";

interface PreviewPageProps {
  pageKey: PageKey;
}

export function PreviewPage({ pageKey }: PreviewPageProps) {
  const cms = useContext(CmsContext);
  const overrides = useMemo(() => {
    if (!cms) return {};
    const draftRow = cms.pageContents[pageKey]?.draft;
    const draftContent = draftRow?.content;
    if (!draftContent) return {};

    switch (pageKey) {
      case "landing": {
        const parsed = safeParsePageContent("landing", draftContent);
        if (!parsed.success) return {};
        return { landingContent: parsed.data, servicesContent: cms.servicesContent };
      }
      case "about": {
        const parsed = safeParsePageContent("about", draftContent);
        if (!parsed.success) return {};
        return { aboutContent: parsed.data };
      }
      case "services": {
        const parsed = safeParsePageContent("services", draftContent);
        if (!parsed.success) return {};
        return { servicesContent: parsed.data };
      }
      case "contact": {
        const parsed = safeParsePageContent("contact", draftContent);
        if (!parsed.success) return {};
        return { contactContent: parsed.data };
      }
    }
  }, [pageKey, cms]);

  if (!cms) {
    return <div className="app"><div className="container" style={{ padding: "4rem 0", textAlign: "center" }}><h2>Loading preview…</h2></div></div>;
  }

  const previewValue: CmsContextValue = { ...cms, ...overrides };

  const pageComponent: ReactNode = (() => {
    switch (pageKey) {
      case "landing":
      case "services":
        return <Home />;
      case "about":
        return <About />;
      case "contact":
        return <Contact />;
    }
  })();

  return (
    <CmsContext.Provider value={previewValue}>
      {pageComponent}
    </CmsContext.Provider>
  );
}
