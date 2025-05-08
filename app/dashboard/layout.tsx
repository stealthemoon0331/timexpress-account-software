import DashboardGuard from "@/components/dashboard/dashboard-guard";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { UserProvider } from "../contexts/UserContext";

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </DashboardGuard>
    </UserProvider>
  );
}
