import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarInsetContent from "@/pages/SidebarInsetContent/SidebarInsetContent";


export default function DefaultLayout() {
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />
      
      {/* Main content */}
      <SidebarInsetContent/>
    </SidebarProvider>
  )
}
