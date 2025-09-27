
import BottomNav from "@/components/BottomNav";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
