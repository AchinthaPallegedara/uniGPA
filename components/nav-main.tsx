"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const path = usePathname();
  const isActive = (itemUrl: string) => {
    // Handle exact matches
    if (path === itemUrl) return true;

    // If current path contains segments after dashboard ID (like /dashboard/[id]/subjects)
    if (itemUrl.includes("/dashboard") && path.includes("/dashboard/")) {
      const currentPathParts = path.split("/");
      const itemUrlParts = itemUrl.split("/");

      // If we're on a specific feature page within a dashboard (subjects, grades, etc.)
      if (currentPathParts.length > 3 && itemUrlParts.length > 2) {
        // For the dashboard URL item, return false when on a feature page
        if (itemUrlParts.length === 3) {
          return false;
        }

        // For feature page URLs (like subjects), only match the exact feature
        if (itemUrlParts.length > 3) {
          return currentPathParts[3] === itemUrlParts[3];
        }
      }
    }

    // For other routes, use the startsWith behavior
    return path.startsWith(itemUrl + "/");
  };
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu></SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`${
                    isActive(item.url)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                      : ""
                  }`}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
