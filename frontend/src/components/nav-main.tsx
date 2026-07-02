"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  groups,
}: {
  groups: {
    title: string;
    items: {
      title: string;
      url: string;
      icon?: React.ReactNode;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel className="text-xs uppercase text-muted-foreground/70 font-semibold tracking-wider">
            {group.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu className="gap-2">
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link href={item.url as Route} />}
                    isActive={pathname.startsWith(item.url)}
                    className="text-base rounded-md data-active:bg-primary/10 data-active:text-primary data-active:font-semibold hover:bg-muted/50 transition-colors"
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
