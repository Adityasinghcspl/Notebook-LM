import * as React from "react";
import { Brain, CircleFadingPlus, FileChartColumn, MoreVertical, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { Loader } from "./ui/loader";

import { NavUser } from "@/components/nav-user";
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
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import AddSourceModal from "./add-source-modal";
import { toast } from "react-toastify";
import { deleteCollection, getAllCollectionList } from "@/redux/features/slice/collectionsSlice";
import { cn } from "@/lib/utils";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();

  const { data: collections, isLoading } = useSelector((state: RootState) => state.collections);
  const user = useSelector((state: RootState) => state.user.data?.providerData);

  const userData = {
    name: user?.[0]?.displayName || "User",
    email: user?.[0]?.email || "user@example.com",
    avatar: user?.[0]?.photoURL || "/avatars/default.jpg",
  };

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);
  const [titleName, SetTitleName] = React.useState<string | null>(null);

  //  Fetch collections on mount
  React.useEffect(() => {
    dispatch(getAllCollectionList())
      .unwrap()
      .catch((err) => {
        toast.error(err || "Failed to load collections");
      });
  }, [dispatch]);

  const handleDelete = async (name: string) => {
    try {
      const msg = await dispatch(deleteCollection(name)).unwrap();
      toast.success(msg);
      
    } catch (err: any) {
      toast.error(err);
    }
  };

  const handleAddClick = (title?: string) => {
    setIsAddModalOpen(true);
    title ? SetTitleName(title) : SetTitleName(null)
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedCollection((prev) => (prev === id ? null : id)); // only one selected
  };

  return (
    <>
      <Sidebar collapsible="icon" variant="inset" {...props} className="transition-all duration-300">
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
                <SidebarMenuItem>
                  {open ? (
                    <Button
                      variant="outline"
                      className="w-full mt-2 flex items-center justify-center gap-2"
                      onClick={() => handleAddClick()}
                    >
                      <CircleFadingPlus className="size-4" />
                      Add
                    </Button>
                  ) : (
                    <SidebarMenuButton className="gap-2 px-4 py-2" onClick={() => handleAddClick()}>
                      <CircleFadingPlus className="size-4" />
                      Add
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarGroupLabel className="pt-8 text-sm">Select sources</SidebarGroupLabel>

              {/* Loader */}
              {isLoading && (
                <div className="flex items-center justify-center ">
                  <Loader size={24} className="h-[50vh]" />
                </div>
              )}

              {/* Empty State */}
              {!isLoading && collections.length === 0 && open && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-20">
                  <FileChartColumn className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Saved sources will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click Add source above to add PDFs, websites, text, videos, or audio files.
                  </p>
                </div>
              )}

              {/* Collection List */}
              <div className="pt-4"> {/* Padding top for the whole list */}
                {!isLoading &&
                  collections.map((collection) => {
                    const isActive = selectedCollection === collection.name

                    return (
                      <div
                        key={collection.name}
                        onClick={() => handleCheckboxChange(collection.name)}
                        className={cn(
                          "flex items-center justify-between gap-2 py-1.5 px-2 mt-2 rounded-md transition-colors border cursor-pointer",
                          isActive
                            ? "bg-muted border-primary"
                            : "bg-transparent hover:bg-muted/40 border-transparent"
                        )}
                      >
                        {/* Collection name */}
                        <span className="text-sm font-medium">{collection.name}</span>

                        {/* Three dots menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.stopPropagation()} // prevent row click
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddClick(collection.name)}>
                              <CircleFadingPlus className="size-4" />
                              Add Source
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(collection.name)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
              </div>

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer (user profile) */}
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      <AddSourceModal isOpen={isAddModalOpen} onClose={closeModals} title={titleName} />
    </>
  )
}
