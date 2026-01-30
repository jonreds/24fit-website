import Link from "next/link";
import Image from "next/image";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <main>{children}</main>
    </div>
  );
}
