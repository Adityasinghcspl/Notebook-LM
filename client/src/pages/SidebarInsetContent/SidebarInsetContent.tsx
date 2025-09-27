import EmptyState from "@/components/empty-state";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
      <SidebarInset>
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
                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 flex-1 rounded-xl p-6 shadow-sm border text-base leading-relaxed text-muted-foreground overflow-y-auto flex flex-col">
            {/* Empty state centered */}
            {/* {isEmpty && ( */}
            <div className="flex flex-1 items-center justify-center">
              <EmptyState isEmpty={isEmpty} selectedCollection={selectedCollection} />
            </div>
            {/* )} */}

            {/* Chat always visible, but disabled if empty */}
            <div className="mt-auto">
              <div className={isEmpty || !selectedCollection ? "pointer-events-none opacity-50" : ""}>
                <ChatModal />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
