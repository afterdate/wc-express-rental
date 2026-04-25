"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Trailer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, Loader2, ArrowLeft, Users, Phone, Mail, Clock } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

export default function TrailerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Booking form state
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchTrailer();
      fetchBookedDates();
    }
  }, [params.id]);

  async function fetchTrailer() {
    try {
      const { data, error } = await supabase
        .from("trailers")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error) throw error;
      setTrailer(data);
    } catch (error) {
      console.error("Error fetching trailer:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBookedDates() {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("start_date, end_date")
        .eq("trailer_id", params.id)
        .in("status", ["confirmed", "pending"]);
      
      if (error) throw error;
      
      // Convert to array of all booked dates
      const dates: Date[] = [];
      data?.forEach((booking) => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        for (let d = start; d <= end; d = addDays(d, 1)) {
          dates.push(new Date(d));
        }
      });
      setBookedDates(dates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  }

  function isDateBooked(date: Date) {
    return bookedDates.some(
      (bookedDate) => format(bookedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!trailer || !startDate || !endDate) return;

    setBookingLoading(true);
    
    try {
      const days = differenceInDays(endDate, startDate) + 1;
      const totalPrice = days * trailer.price_per_day;

      const { error } = await supabase.from("bookings").insert({
        trailer_id: trailer.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        total_price: totalPrice,
        notes: notes,
        status: "pending",
      });

      if (error) throw error;
      setShowSuccess(true);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Buchung konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.");
    } finally {
      setBookingLoading(false);
    }
  }

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalPrice = trailer ? totalDays * trailer.price_per_day : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066CC]" />
      </div>
    );
  }

  if (!trailer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Anhänger nicht gefunden</CardTitle>
            <CardDescription>Der gesuchte Anhänger existiert nicht.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/trailers">Zurück zur Übersicht</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      toilet: "WC-Anhänger",
      shower: "Duschanhänger",
      kitchen: "Küchenanhänger",
      changing: "Umkleidekabine",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0066CC] text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">WC-Express</Link>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/trailers">Zurück</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/trailers" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trailer Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{getTypeLabel(trailer.type)}</Badge>
                    <CardTitle className="text-2xl">{trailer.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#0066CC]">{trailer.price_per_day}€</div>
                    <div className="text-slate-500">pro Tag</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-slate-600">{trailer.description}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <Users className="w-5 h-5 mx-auto mb-2 text-[#0066CC]" />
                    <div className="font-semibold">{trailer.capacity}</div>
                    <div className="text-sm text-slate-500">Personen</div>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-[#0066CC]" />
                    <div className="font-semibold">24h</div>
                    <div className="text-sm text-slate-500">Lieferung</div>
                  </div>
                </div>

                {trailer.features && trailer.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Ausstattung</h3>
                    <div className="flex flex-wrap gap-2">
                      {trailer.features.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Jetzt buchen</CardTitle>
                <CardDescription>Wählen Sie Ihren Zeitraum</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label>Mietzeitraum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate && endDate ? (
                            <span>
                              {format(startDate, "dd.MM.yyyy")} - {format(endDate, "dd.MM.yyyy")}
                            </span>
                          ) : (
                            <span className="text-slate-500">Zeitraum auswählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: startDate,
                            to: endDate,
                          }}
                          onSelect={(range) => {
                            setStartDate(range?.from);
                            setEndDate(range?.to);
                          }}
                          disabled={(date) =>
                            date < new Date() || isDateBooked(date)
                          }
                          initialFocus
                          locale={de}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Max Mustermann"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="max@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+49 123 456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Anmerkungen (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Sonderwünsche, Lieferadresse, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Price Summary */}
                  {totalDays > 0 && (
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>{totalDays} Tage × {trailer.price_per_day}€</span>
                        <span>{totalPrice}€</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Gesamt</span>
                        <span className="text-[#0066CC]">{totalPrice}€</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={bookingLoading || !startDate || !endDate || !customerName || !customerEmail || !customerPhone}
                  >
                    {bookingLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buchung wird erstellt...</>
                    ) : (
                      "Jetzt buchen"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Buchung erfolgreich!</DialogTitle>
            <DialogDescription className="text-center">
              Vielen Dank für Ihre Buchung! Wir werden uns in Kürze bei Ihnen melden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" asChild>
              <Link href="/trailers">Weitere Anhänger</Link>
            </Button>
            <Button asChild>
              <Link href="/">Zur Startseite</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for separator
function Separator() {
  return <div className="h-px bg-slate-300 my-2" />;
}
