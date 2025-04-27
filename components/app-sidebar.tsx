"use client";

import * as React from "react";
import {
  // IconChartBar,
  IconDashboard,
  IconInnerShadowTop,
  IconListDetails,
} from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Session } from "@/lib/auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const data = {
    user: {
      name: session.user.name || "shadcn",
      email: session.user.email || "m@example.com",
      avatar: session.user.image || "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: `/dashboard/${session.user.id}`,
        icon: IconDashboard,
      },
      {
        title: "Subjects",
        url: `/dashboard/${session.user.id}/subjects`,
        icon: IconListDetails,
      },
      // {
      //   title: "Analytics",
      //   url: `/dashboard/${session.user.id}/analytics`,
      //   icon: IconChartBar,
      // },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Uni GPA</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
