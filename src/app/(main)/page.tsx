import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ClubsPreview } from "@/components/sections/ClubsPreview";
import { PlansPreview } from "@/components/sections/PlansPreview";
import { AppCTA } from "@/components/sections/AppCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <ClubsPreview />
      <PlansPreview />
      <AppCTA />
    </>
  );
}
