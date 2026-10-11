import {
  HeroSection,
  TriadaSection,
  CuencasSection,
  ComparativaSection,
  SuiteSection,
  CierreSection,
} from '@/components/home-page-rebuild'
import { ScrollWorld } from '@/components/scroll-world'

export default function HomePage() {
  return (
    <main className="bg-[#1b1410] text-[#f0eae1] selection:bg-[#d87a52] selection:text-[#1b1410]">
      <HeroSection />
      <ScrollWorld />
      <TriadaSection />
      <CuencasSection />
      <ComparativaSection />
      <SuiteSection />
      <CierreSection />
    </main>
  )
}
