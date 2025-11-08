"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { propertiesApi } from "@/lib/api";
import { PROPERTY_TYPE, CONTRACT_TYPE } from "@/lib/constants";

/**
 * CRM IMMOBILIARE - New Property Form
 *
 * Simple property creation form with essential fields
 *
 * @module pages/immobili/new
 * @since v3.1.1
 */

export default function NewPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Type & Contract
    contractType: "sale",
    propertyType: "apartment",

    // Address
    street: "",
    civic: "",
    city: "",
    province: "",
    zone: "",
    latitude: 0,
    longitude: 0,

    // Dimensions
    sqmCommercial: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",

    // Price
    priceSale: "",
    priceRentMonthly: "",

    // Features
    hasElevator: false,
    hasParking: false,
    hasGarden: false,
    hasBalcony: false,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...formData,
        sqmCommercial: formData.sqmCommercial ? parseFloat(formData.sqmCommercial) : undefined,
        rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        priceSale: formData.priceSale ? parseFloat(formData.priceSale) : undefined,
        priceRentMonthly: formData.priceRentMonthly ? parseFloat(formData.priceRentMonthly) : undefined,
      };
      return await propertiesApi.create(data);
    },
    onSuccess: (response) => {
      router.push(`/immobili/${response.property.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/immobili")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna agli immobili
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nuovo Immobile</h1>
        <p className="text-muted-foreground mt-1">
          Compila i campi essenziali per aggiungere un immobile al portafoglio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type & Contract */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo e Contratto</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contratto *</label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => setFormData({ ...formData, contractType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Vendita</SelectItem>
                  <SelectItem value="rent">Affitto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipologia *</label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Appartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="office">Ufficio</SelectItem>
                  <SelectItem value="commercial">Commerciale</SelectItem>
                  <SelectItem value="land">Terreno</SelectItem>
                  <SelectItem value="garage">Box/Garage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Indirizzo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Via *</label>
                <Input
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Via Roma"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Civico</label>
                <Input
                  value={formData.civic}
                  onChange={(e) => setFormData({ ...formData, civic: e.target.value })}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Città *</label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Milano"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Provincia *</label>
                <Input
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="MI"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zona</label>
                <Input
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Centro"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Superficie (m²)</label>
              <Input
                type="number"
                value={formData.sqmCommercial}
                onChange={(e) => setFormData({ ...formData, sqmCommercial: e.target.value })}
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Locali</label>
              <Input
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Camere</label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bagni</label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader>
            <CardTitle>Prezzo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.contractType === "sale" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Prezzo vendita (€) *</label>
                <Input
                  required
                  type="number"
                  value={formData.priceSale}
                  onChange={(e) => setFormData({ ...formData, priceSale: e.target.value })}
                  placeholder="250000"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Canone mensile (€) *</label>
                <Input
                  required
                  type="number"
                  value={formData.priceRentMonthly}
                  onChange={(e) => setFormData({ ...formData, priceRentMonthly: e.target.value })}
                  placeholder="800"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Caratteristiche</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ascensore</label>
              <Switch
                checked={formData.hasElevator}
                onCheckedChange={(checked) => setFormData({ ...formData, hasElevator: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Parcheggio</label>
              <Switch
                checked={formData.hasParking}
                onCheckedChange={(checked) => setFormData({ ...formData, hasParking: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Giardino</label>
              <Switch
                checked={formData.hasGarden}
                onCheckedChange={(checked) => setFormData({ ...formData, hasGarden: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Balcone</label>
              <Switch
                checked={formData.hasBalcony}
                onCheckedChange={(checked) => setFormData({ ...formData, hasBalcony: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/immobili")}
            disabled={createMutation.isPending}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? "Salvataggio..." : "Salva Immobile"}
          </Button>
        </div>

        {createMutation.isError && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            Errore durante il salvataggio. Riprova.
          </div>
        )}
      </form>
    </div>
  );
}
