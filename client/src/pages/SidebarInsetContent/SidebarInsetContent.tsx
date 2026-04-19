import EmptyState from "@/components/empty-state";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import ChatModal from "./ChatModal";


export default function SidebarInsetContent() {
  const { data: collections, selectedCollection } = useSelector((state: RootState) => state.collections);
  const isEmpty = collections.length === 0;

  return (
    <>
      <SidebarInset className="h-[100svh] md:h-[calc(100svh-1rem)] overflow-hidden">
        <header
          className="
            sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 px-4 border-b
            bg-background backdrop-blur supports-[backdrop-filter]:bg-background/70 rounded-t-xl"
        >
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">AI-powered NotebookLM</BreadcrumbLink>
              </BreadcrumbItem>
              {/* <BreadcrumbSeparator className="hidden md:block" /> */}
              {/* <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem> */}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">
          <div className="bg-muted/50 flex-1 rounded-xl shadow-sm border text-base leading-relaxed text-muted-foreground flex flex-col overflow-hidden min-h-0">
            {/* Empty state — only when no sources */}
            {isEmpty && (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState isEmpty={isEmpty} selectedCollection={selectedCollection} />
              </div>
            )}

            {/* Chat — fills the panel when sources exist */}
            {!isEmpty && (
              <div className={`flex flex-1 flex-col min-h-0 ${!selectedCollection ? 'pointer-events-none opacity-50' : ''}`}>
                <ChatModal />
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
