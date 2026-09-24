"use client";

import { useRef, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutContext } from "@/lib/contexts/LayoutContext";

const tabs = [
  { label: "すべての猫", href: "/" },
  { label: "自分が投稿した猫", href: "/?filter=my_posts" },
  { label: "かわいいした猫", href: "/?filter=favorites" },
];

export default function TabsBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const layoutContext = useContext(LayoutContext);
  if (!layoutContext) {
    throw new Error("LayoutContext must be used within a LayoutProvider");
  }
  const { user, setIsLoginPromptOpen } = layoutContext;

  const tabRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const getActiveTabHref = () => {
    if (pathname !== "/") return "";
    if (filter === "my_posts") return "/?filter=my_posts";
    if (filter === "favorites") return "/?filter=favorites";
    return "/";
  };

  const activeTabHref = getActiveTabHref();

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href === "/") return;

    if (!user) {
      e.preventDefault();
      setIsLoginPromptOpen(true);
    }
  };

  useEffect(() => {
    const el = tabRefs.current[activeTabHref];
    const indicator = indicatorRef.current;

    if (el && indicator) {
      indicator.style.width = `${el.offsetWidth}px`;
      indicator.style.left = `${el.offsetLeft}px`;
    }
  }, [activeTabHref]);

  return (
    <div className="w-full border-b bg-base-100">
      <div className="flex justify-around overflow-x-auto relative">
        {" "}
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            ref={(el) => {
              tabRefs.current[tab.href] = el;
            }}
            onClick={(e) => handleTabClick(e, tab.href)}
            className={`
              px-4
              whitespace-nowrap
              py-3 text-sm
              md:py-4 md:text-base md:tracking-wide
              transition-colors
              cursor-pointer
              ${
                activeTabHref === tab.href
                  ? "font-bold text-black"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.label}
          </Link>
        ))}
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-0.5 md:h-[3px] bg-black transition-all duration-300"
        />
      </div>
    </div>
  );
}
