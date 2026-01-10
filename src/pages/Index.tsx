import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ListingsSection from "@/components/ListingsSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ListingsSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
