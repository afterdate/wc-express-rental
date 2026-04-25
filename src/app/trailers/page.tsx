"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Trailer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, ArrowRight, Loader2 } from "lucide-react";

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTrailers();
  }, []);

  async function fetchTrailers() {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setTrailers(data || []);
    } catch (error) {
      console.error("Error fetching trailers:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTrailers = trailers.filter((trailer) => {
    const matchesFilter = filter === "all" || trailer.type === filter;
    const matchesSearch = trailer.name.toLowerCase().includes(search.toLowerCase()) ||
                         trailer.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const trailerTypes = [
    { value: "all", label: "Alle Typen" },
    { value: "toilet", label: "WC-Anhänger" },
    { value: "shower", label: "Duschanhänger" },
    { value: "kitchen", label: "Küchenanhänger" },
    { value: "changing", label: "Umkleidekabinen" },
  ];

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      toilet: "🚻",
      shower: "🚿",
      kitchen: "🍳",
      changing: "👕",
    };
    return icons[type] || "🚛";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      toilet: "WC-Anhänger",
      shower: "Duschanhänger",
      kitchen: "Küchenanhänger",
      changing: "Umkleidekabine",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Verfügbar</Badge>;
      case "maintenance":
        return <Badge className="bg-orange-100 text-orange-800">Wartung</Badge>;
      case "reserved":
        return <Badge className="bg-red-100 text-red-800">Reserviert</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0066CC] text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            WC-Express
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/trailers" className="text-blue-200">Anhänger</Link>
            <Link href="/about" className="hover:text-blue-200 transition">Über uns</Link>
            <Link href="/contact" className="hover:text-blue-200 transition">Kontakt</Link>
          </nav>
          <Button variant="secondary" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Unsere Anhänger</h1>
          <p className="text-slate-600">Wählen Sie den passenden Anhänger für Ihr Event oder Ihre Baustelle.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Anhänger suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Alle Typen" />
            </SelectTrigger>
            <SelectContent>
              {trailerTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trailers Grid */}
        {filteredTrailers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">Keine Anhänger gefunden.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrailers.map((trailer) => (
              <Card key={trailer.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-5xl">{getTypeIcon(trailer.type)}</div>
                    {getStatusBadge(trailer.status)}
                  </div>
                  <CardTitle className="mt-4">{trailer.name}</CardTitle>
                  <CardDescription>{getTypeLabel(trailer.type)}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-slate-600 text-sm mb-4">{trailer.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{trailer.capacity} Personen</span>
                    </div>
                  </div>

                  {trailer.features && trailer.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {trailer.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-2xl font-bold text-[#0066CC]">
                      {trailer.price_per_day}€
                    </span>
                    <span className="text-slate-500 text-sm">/Tag</span>
                  </div>
                  <Button asChild>
                    <Link href={`/trailers/${trailer.id}`} className="flex items-center gap-1">
                      Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
