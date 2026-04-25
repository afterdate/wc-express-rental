import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Truck, Clock, Phone, CheckCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0066CC] text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            WC-Express
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/trailers" className="hover:text-blue-200 transition">
              Anhänger
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition">
              Über uns
            </Link>
            <Link href="/contact" className="hover:text-blue-200 transition">
              Kontakt
            </Link>
          </nav>
          <Button variant="secondary" asChild>
            <Link href="/trailers">Anhänger mieten</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0066CC] to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Mobile Anhänger-Vermietung
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-blue-100">
            WC-Anhänger, Duschen, Küchen & mehr für Events, Baustellen und Festivals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/trailers" className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Jetzt buchen
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="tel:+491234567890" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Beratung anrufen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Warum WC-Express?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-[#0066CC]" />
              </div>
              <CardTitle>Deutschlandweite Lieferung</CardTitle>
              <CardDescription>
                Wir liefern zu Ihnen – egal wo in Deutschland
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[#0066CC]" />
              </div>
              <CardTitle>24h Lieferung</CardTitle>
              <CardDescription>
                Kurzfristige Buchungen möglich – oft noch am selben Tag
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[#0066CC]" />
              </div>
              <CardTitle>Premium Qualität</CardTitle>
              <CardDescription>
                Saubere, moderne Anhänger – geprüft und instandgehalten
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Trailer Types Preview */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Unsere Anhänger</h2>
            <Link href="/trailers" className="text-[#0066CC] flex items-center gap-2 hover:underline">
              Alle anzeigen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trailerTypes.map((type) => (
              <Card key={type.name} className="group cursor-pointer hover:shadow-lg transition">
                <CardHeader>
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    ab {type.price} €/Tag
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bereit zur Buchung?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Wählen Sie Ihren Anhänger, prüfen Sie die Verfügbarkeit und buchen Sie direkt online.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/trailers">Anhänger auswählen</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">WC-Express</h3>
              <p className="text-sm">Ihr Partner für mobile Sanitär- und Interimslösungen.</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Angebote</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/trailers" className="hover:text-white">WC-Anhänger</Link></li>
                <li><Link href="/trailers" className="hover:text-white">Duschanhänger</Link></li>
                <li><Link href="/trailers" className="hover:text-white">Küchenanhänger</Link></li>
                <li><Link href="/trailers" className="hover:text-white">Umkleidekabinen</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Service</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/admin" className="hover:text-white">Admin Login</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
                <li><Link href="/imprint" className="hover:text-white">Impressum</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Kontakt</h3>
              <p className="text-sm">Tel: +49 123 4567890</p>
              <p className="text-sm">info@wc-express.com</p>
            </div>
          </div>
          
          <Separator className="bg-slate-800" />
          
          <p className="text-center text-sm mt-8">
            © 2024 WC-Express. Alle Rechte vorbehalten.
          </p>
        </div>
      </footer>
    </div>
  );
}

const trailerTypes = [
  {
    name: "WC-Anhänger",
    description: "Mobile Toiletten für Events und Baustellen",
    price: "85",
    icon: "🚻",
  },
  {
    name: "Duschanhänger",
    description: "Warmwasserduschen für Festivals",
    price: "120",
    icon: "🚿",
  },
  {
    name: "Küchenanhänger",
    description: "Vollausgestattete mobile Küchen",
    price: "150",
    icon: "🍳",
  },
  {
    name: "Umkleidekabinen",
    description: "Für Sportevents und Veranstaltungen",
    price: "95",
    icon: "👕",
  },
];
