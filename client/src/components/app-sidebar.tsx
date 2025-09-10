import * as React from "react"
import { Brain, CircleFadingPlus, FileChartColumn } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { Button } from "./ui/button"
import AddSourceModal from "./add-source-modal"


export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()

  const user = useSelector((state: RootState) => state.user.data?.providerData);
  const userData = {
    name: user?.[0]?.displayName || "User",
    email: user?.[0]?.email || "user@example.com",
    avatar: user?.[0]?.photoURL || "/avatars/default.jpg",
  }

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  // const [sources, setSources] = useLocalStorage<Source[]>('sources', []);
  // const [selectedSources, setSelectedSources] = useLocalStorage<string[]>('selectedSources', []);
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="inset"
        {...props}
        className="transition-all duration-300"
      >
        {/* Sidebar Header */}
        <SidebarHeader>
          <div className="flex items-center justify-between pr-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="#">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    {open && (
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Acme Inc</span>
                        <span className="truncate text-xs">Enterprise</span>
                      </div>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm">Sources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem >
                  {open ? (
                    <Button variant="outline" className="w-full mt-2 flex items-center justify-center gap-2" onClick={handleAddClick}>
                      <CircleFadingPlus className="size-4" />
                      Add
                    </Button>
                  ) : (
                    <SidebarMenuButton className="gap-2 px-4 py-2" onClick={handleAddClick}>
                      <CircleFadingPlus className="size-4" />
                      Add
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarGroupLabel className="pt-8 text-sm">Select all sources</SidebarGroupLabel>

              {/* Empty State */}
              {open && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-35 ">
                  <FileChartColumn className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Saved sources will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click Add source above to add PDFs, websites, text, videos, or audio files.
                  </p>
                </div>
              )}

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer (user profile) */}
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        // onSourceAdded={handleSourceAdded}
        // onSuccess={handleSuccess}
        // onError={handleError}
      />
    </>
  )
}
