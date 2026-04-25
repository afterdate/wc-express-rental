"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, type Booking, type Trailer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2, CheckCircle, XCircle, Calendar, Truck, Users, DollarSign } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [bookingsRes, trailersRes] = await Promise.all([
        supabase.from("bookings").select("*, trailers(name)").order("created_at", { ascending: false }),
        supabase.from("trailers").select("*"),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (trailersRes.error) throw trailersRes.error;

      setBookings(bookingsRes.data || []);
      setTrailers(trailersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: status as any } : b
      ));
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  }

  const stats = {
    totalTrailers: trailers.length,
    availableTrailers: trailers.filter(t => t.status === "available").length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "pending").length,
    confirmedBookings: bookings.filter(b => b.status === "confirmed").length,
    revenue: bookings
      .filter(b => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + b.total_price, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Bestätigt</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Storniert</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Abgeschlossen</Badge>;
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
          <Link href="/" className="text-2xl font-bold">WC-Express Admin</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:text-blue-200">Zur Website</Link>
            <Button variant="secondary" size="sm">Abmelden</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Anhänger</CardTitle>
              <Truck className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrailers}</div>
              <p className="text-xs text-slate-500">{stats.availableTrailers} verfügbar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Buchungen</CardTitle>
              <Calendar className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-slate-500">{stats.pendingBookings} ausstehend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bestätigt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
              <p className="text-xs text-slate-500">Aktive Buchungen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenue.toFixed(2)}€</div>
              <p className="text-xs text-slate-500">Bestätigte Buchungen</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">Buchungen</TabsTrigger>
            <TabsTrigger value="trailers">Anhänger</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Buchungsübersicht</CardTitle>
                <CardDescription>Alle Buchungen verwalten</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Anhänger</TableHead>
                      <TableHead>Zeitraum</TableHead>
                      <TableHead>Preis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.customer_name}</div>
                            <div className="text-sm text-slate-500">{booking.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{(booking as any).trailers?.name || booking.trailer_id}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(parseISO(booking.start_date), "dd.MM.yyyy", { locale: de })}</div>
                            <div className="text-slate-500">bis {format(parseISO(booking.end_date), "dd.MM.yyyy", { locale: de })}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.total_price}€</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trailers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Anhänger verwalten</CardTitle>
                    <CardDescription>Alle verfügbaren Anhänger</CardDescription>
                  </div>
                  <Button>Neuer Anhänger</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Preis/Tag</TableHead>
                      <TableHead>Kapazität</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trailers.map((trailer) => (
                      <TableRow key={trailer.id}>
                        <TableCell className="font-medium">{trailer.name}</TableCell>
                        <TableCell>{trailer.type}</TableCell>
                        <TableCell>{trailer.price_per_day}€</TableCell>
                        <TableCell>{trailer.capacity} Personen</TableCell>
                        <TableCell>{getStatusBadge(trailer.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buchungsdetails</DialogTitle>
            <DialogDescription>
              Buchung vom {selectedBooking && format(parseISO(selectedBooking.created_at), "dd.MM.yyyy", { locale: de })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kunde</Label>
                  <div className="font-medium">{selectedBooking.customer_name}</div>
                  <div className="text-sm text-slate-500">{selectedBooking.customer_email}</div>
                  <div className="text-sm text-slate-500">{selectedBooking.customer_phone}</div>
                </div>
                
                <div>
                  <Label>Zeitraum</Label>
                  <div className="font-medium">
                    {format(parseISO(selectedBooking.start_date), "dd.MM.yyyy", { locale: de })} - {format(parseISO(selectedBooking.end_date), "dd.MM.yyyy", { locale: de })}
                  </div>
                  <div className="text-sm text-slate-500">Gesamtpreis: {selectedBooking.total_price}€</div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label>Anmerkungen</Label>
                  <p className="text-slate-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedBooking.status === "pending" && (
                  <>
                    <Button 
                      onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Bestätigen
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Ablehnen
                    </Button>
                  </>
                )}
                
                {selectedBooking.status === "confirmed" && (
                  <Button 
                    onClick={() => updateBookingStatus(selectedBooking.id, "completed")}
                    variant="outline"
                  >
                    Als abgeschlossen markieren
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-slate-700 mb-1">{children}</p>;
}
