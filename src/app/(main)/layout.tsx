import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PromoPopup } from "@/components/ui/PromoPopup";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <PromoPopup />
    </>
  );
}
