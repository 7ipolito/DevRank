import BottomNav from "@/components/BottomNav";
import DashboardPage from "./(with-nav)/dashboard/page";
import LoginPage from "./login/page";

const Page = async () => {
  return (
    <div className="bg-white text-black ">
      <DashboardPage />
      <BottomNav />
    </div>
  );
};

export default Page;
