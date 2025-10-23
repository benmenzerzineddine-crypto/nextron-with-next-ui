import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";

export const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "relative flex flex-col h-screen bg-default-100 transition-width duration-300",
        {
          "w-64": isExpanded,
          "w-20": !isExpanded,
        }
      )}
    >
      <div className="flex items-center justify-center p-4">
        <NextLink href="/" className="flex items-center gap-2">
          <Logo />
          <span className={clsx("font-bold text-inherit", { "hidden": !isExpanded })}>KDA</span>
        </NextLink>
      </div>
      <nav className="flex flex-col gap-2 px-4">
        {siteConfig.navItems.map((item) => (
          <Tooltip
            key={item.href}
            content={item.label}
            placement="right"
            isDisabled={isExpanded}
          >
            <NextLink
              href={item.href}
              className={clsx(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                {
                  "bg-primary text-primary-foreground": pathname === item.href,
                  "hover:bg-default-200": pathname !== item.href,
                  "justify-center": !isExpanded,
                }
              )}
            >
              <item.icon className="text-2xl shrink-0" />
              <span className={clsx("text-sm font-medium", { "hidden": !isExpanded })}>
                {item.label}
              </span>
            </NextLink>
          </Tooltip>
        ))}
      </nav>
      <div className={`mt-auto flex ${isExpanded ? "flex-row justify-between" : "flex-col items-center"} gap-2 p-4`}>
        <ThemeSwitch />
        <Button isIconOnly variant="light" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
      </div>
    </div>
  );
};