"use client";

import {
  FileTextIcon,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  ReceiptIcon,
  UsersIcon,
} from "lucide-react";
import type * as React from "react";
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

const data = {
  user: {
    name: "HR Admin",
    email: "hr.admin@acme.com",
    avatar: "",
  },
  navGroups: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboardIcon />,
        },
        {
          title: "Employees",
          url: "/employees",
          icon: <UsersIcon />,
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          title: "Payroll",
          url: "/payroll",
          icon: <ReceiptIcon />,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: <FileTextIcon />,
        },
      ],
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
              render={<a href="/dashboard" />}
            >
              <GalleryVerticalEnd className="size-6" />
              <span className="text-lg font-semibold">Acme Salary</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={data.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
