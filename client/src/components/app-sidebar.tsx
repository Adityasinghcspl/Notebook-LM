import * as React from "react";
import { Brain, CircleFadingPlus, FileChartColumn, MoreVertical, Trash2, Plus, ChevronRight, Database, History } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
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
import { deleteCollection, getAllCollectionList, setSelectedCollection } from "@/redux/features/slice/collectionsSlice";
import { createNewSession, setActiveSession, deleteSession } from "@/redux/features/slice/chatSlice";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();

  const { data: collections, isLoading, selectedCollection } = useSelector((state: RootState) => state.collections);
  const { sessions, activeSessionId } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user.data?.providerData);

  const userData = {
    name: user?.[0]?.displayName || "User",
    email: user?.[0]?.email || "user@example.com",
    avatar: user?.[0]?.photoURL || "/avatars/default.jpg",
  };

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
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
    dispatch(setSelectedCollection(id));
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
                        <span className="truncate font-medium">Nootbook LM</span>
                        {/* <span className="truncate text-xs">Enterprise</span> */}
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
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Select sources">
                      <Database className="w-4 h-4" />
                      <span>Select sources</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>

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
                      <div className="pt-2 pb-2 text-sm flex flex-col gap-1.5">
                        {!isLoading &&
                          collections.map((collection) => {
                            const isActive = selectedCollection === collection.name

                            return (
                              <SidebarMenuSubItem key={collection.name}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive}
                                  onClick={() => handleCheckboxChange(collection.name)}
                                  className={cn("cursor-pointer pr-8 h-auto py-2", isActive && "font-bold")}
                                >
                                  <span>{collection.name}</span>
                                </SidebarMenuSubButton>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction showOnHover>
                                      <MoreVertical className="w-4 h-4" />
                                    </SidebarMenuAction>
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
                              </SidebarMenuSubItem>
                            )
                          })}
                      </div>

                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>

          {/* Chat History Group */}
          <SidebarGroup className="mt-2">
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Recent Chats">
                      <History className="w-4 h-4" />
                      <span>Recent Chats</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {open && selectedCollection && (
                    <SidebarMenuAction
                      onClick={() => dispatch(createNewSession(selectedCollection))}
                      title="New Chat for selected source"
                    >
                      <Plus className="w-4 h-4" />
                    </SidebarMenuAction>
                  )}

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <div className="pt-2 pb-2 text-sm flex flex-col gap-1.5">
                        {sessions.length === 0 && open && (
                          <div className="px-4 py-4 text-xs text-muted-foreground text-center">
                            No recent chats
                          </div>
                        )}
                        {sessions.map((session) => {
                          const isActive = activeSessionId === session.id;

                          return (
                            <SidebarMenuSubItem key={session.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                                onClick={() => dispatch(setActiveSession(session.id))}
                                className={cn("cursor-pointer pr-8 h-auto py-2", isActive && "font-bold")}
                              >
                                <div className="flex flex-col items-start justify-center overflow-hidden w-full">
                                  <span className={cn("text-xs truncate w-full", isActive ? "font-bold" : "font-medium")}>{session.title}</span>
                                  <span className="text-[10px] text-muted-foreground truncate w-full">{session.collectionName}</span>
                                </div>
                              </SidebarMenuSubButton>

                              <SidebarMenuAction
                                showOnHover
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(deleteSession(session.id));
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </SidebarMenuAction>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </div>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
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
