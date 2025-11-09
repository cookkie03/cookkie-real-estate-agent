"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Search,
  User,
  MapPin,
  Home,
  Euro,
  Calendar,
  AlertCircle,
  ChevronDown,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * CRM IMMOBILIARE - New Request Form
 *
 * Complete request creation form with all database fields:
 * - Client selection & type
 * - Search criteria (cities, zones, property types)
 * - Budget & size requirements
 * - Required features & exclusions
 * - Quality requirements & timing
 *
 * @module pages/richieste/new
 * @since v3.2.0
 */

// Form validation schema
const requestSchema = z.object({
  contactId: z.string().min(1, "Seleziona un cliente"),
  requestType: z.enum(["search_buy", "search_rent", "valuation"]),
  contractType: z.enum(["sale", "rent"]).optional(),
  status: z.enum(["active", "paused", "satisfied", "cancelled"]).default("active"),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),

  // Search criteria
  searchCities: z.array(z.string()).min(1, "Inserisci almeno una città"),
  searchZones: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),

  // Geographic search
  searchRadiusKm: z.number().optional(),
  centerLatitude: z.number().optional(),
  centerLongitude: z.number().optional(),

  // Budget
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),

  // Size
  sqmMin: z.number().optional(),
  sqmMax: z.number().optional(),
  roomsMin: z.number().optional(),
  roomsMax: z.number().optional(),
  bedroomsMin: z.number().optional(),
  bathroomsMin: z.number().optional(),

  // Required features
  requiresElevator: z.boolean().default(false),
  requiresParking: z.boolean().default(false),
  requiresGarden: z.boolean().default(false),
  requiresTerrace: z.boolean().default(false),
  requiresGarage: z.boolean().default(false),
  requiresBalcony: z.boolean().default(false),
  requiresCellar: z.boolean().default(false),
  requiresSwimmingPool: z.boolean().default(false),

  // Exclusions
  excludeGroundFloor: z.boolean().default(false),
  excludeTopFloorNoElevator: z.boolean().default(false),

  // Quality
  minCondition: z.string().optional(),
  minEnergyClass: z.string().optional(),
  maxYearBuilt: z.number().optional(),

  // Timing
  moveDate: z.string().optional(),
  expiresAt: z.string().optional(),

  notes: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function NewRequestPage() {
  const router = useRouter();
  const [cityInput, setCityInput] = useState("");
  const [zoneInput, setZoneInput] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requestType: "search_buy",
      contractType: "sale",
      status: "active",
      urgency: "medium",
      requiresElevator: false,
      requiresParking: false,
      requiresGarden: false,
      requiresTerrace: false,
      requiresGarage: false,
      requiresBalcony: false,
      requiresCellar: false,
      requiresSwimmingPool: false,
      excludeGroundFloor: false,
      excludeTopFloorNoElevator: false,
    },
  });

  const requestType = watch("requestType");
  const contractType = watch("contractType");

  // Fetch contacts for selection
  const { data: contactsData } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts?status=active");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json();
    },
  });

  const contacts = contactsData?.contacts || [];

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          searchCities: selectedCities,
          searchZones: selectedZones.length > 0 ? selectedZones : undefined,
          propertyTypes: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
          moveDate: data.moveDate ? new Date(data.moveDate) : undefined,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create request");
      }
      return response.json();
    },
    onSuccess: () => {
      router.push("/richieste");
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createMutation.mutate(data);
  };

  // Add city
  const addCity = () => {
    if (cityInput.trim() && !selectedCities.includes(cityInput.trim())) {
      setSelectedCities([...selectedCities, cityInput.trim()]);
      setCityInput("");
    }
  };

  // Add zone
  const addZone = () => {
    if (zoneInput.trim() && !selectedZones.includes(zoneInput.trim())) {
      setSelectedZones([...selectedZones, zoneInput.trim()]);
      setZoneInput("");
    }
  };

  // Toggle property type
  const togglePropertyType = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type));
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type]);
    }
  };

  const propertyTypeOptions = [
    { value: "apartment", label: "Appartamento" },
    { value: "house", label: "Casa" },
    { value: "villa", label: "Villa" },
    { value: "office", label: "Ufficio" },
    { value: "commercial", label: "Commerciale" },
    { value: "land", label: "Terreno" },
    { value: "garage", label: "Box/Garage" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Nuova Richiesta</h1>
          <p className="text-muted-foreground">
            Registra una nuova richiesta di ricerca immobili
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <X className="h-4 w-4 mr-2" />
          Annulla
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["client", "search", "budget"]} className="space-y-4">

          {/* SECTION 1: Client & Type */}
          <AccordionItem value="client" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold">Cliente & Tipo Richiesta</span>
                <Badge variant="destructive" className="ml-2">Obbligatorio</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">

              {/* Contact Selection */}
              <div className="space-y-2">
                <Label htmlFor="contactId">Cliente *</Label>
                <Select onValueChange={(value) => setValue("contactId", value)}>
                  <SelectTrigger id="contactId">
                    <SelectValue placeholder="Seleziona cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact: any) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.fullName} {contact.primaryEmail && `(${contact.primaryEmail})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contactId && (
                  <p className="text-sm text-destructive">{errors.contactId.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Request Type */}
                <div className="space-y-2">
                  <Label htmlFor="requestType">Tipo Richiesta *</Label>
                  <Select
                    defaultValue="search_buy"
                    onValueChange={(value) => setValue("requestType", value as any)}
                  >
                    <SelectTrigger id="requestType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search_buy">Cerca acquisto</SelectItem>
                      <SelectItem value="search_rent">Cerca affitto</SelectItem>
                      <SelectItem value="valuation">Valutazione immobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contract Type */}
                {requestType !== "valuation" && (
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Tipo Contratto</Label>
                    <Select
                      defaultValue="sale"
                      onValueChange={(value) => setValue("contractType", value as any)}
                    >
                      <SelectTrigger id="contractType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Vendita</SelectItem>
                        <SelectItem value="rent">Affitto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Stato</Label>
                  <Select
                    defaultValue="active"
                    onValueChange={(value) => setValue("status", value as any)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Attiva</SelectItem>
                      <SelectItem value="paused">In pausa</SelectItem>
                      <SelectItem value="satisfied">Soddisfatta</SelectItem>
                      <SelectItem value="cancelled">Annullata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgenza</Label>
                  <Select
                    defaultValue="medium"
                    onValueChange={(value) => setValue("urgency", value as any)}
                  >
                    <SelectTrigger id="urgency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bassa</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* SECTION 2: Search Criteria */}
          <AccordionItem value="search" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-semibold">Criteri di Ricerca</span>
                <Badge variant="destructive" className="ml-2">Obbligatorio</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">

              {/* Cities */}
              <div className="space-y-2">
                <Label>Città di Ricerca *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Es: Milano, Roma, Torino..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCity();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCity} variant="outline">
                    Aggiungi
                  </Button>
                </div>
                {selectedCities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCities.map((city) => (
                      <Badge key={city} variant="secondary" className="gap-1">
                        {city}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setSelectedCities(selectedCities.filter((c) => c !== city))
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {selectedCities.length === 0 && (
                  <p className="text-sm text-destructive">Inserisci almeno una città</p>
                )}
              </div>

              {/* Zones */}
              <div className="space-y-2">
                <Label>Zone/Quartieri (facoltativo)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Es: Centro, Porta Venezia, Navigli..."
                    value={zoneInput}
                    onChange={(e) => setZoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addZone();
                      }
                    }}
                  />
                  <Button type="button" onClick={addZone} variant="outline">
                    Aggiungi
                  </Button>
                </div>
                {selectedZones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedZones.map((zone) => (
                      <Badge key={zone} variant="secondary" className="gap-1">
                        {zone}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setSelectedZones(selectedZones.filter((z) => z !== zone))
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Types */}
              <div className="space-y-2">
                <Label>Tipologie Immobile</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {propertyTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedPropertyTypes.includes(option.value)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => togglePropertyType(option.value)}
                    >
                      <Checkbox
                        checked={selectedPropertyTypes.includes(option.value)}
                        onCheckedChange={() => togglePropertyType(option.value)}
                      />
                      <Label className="cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Search Radius */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchRadiusKm">Raggio Ricerca (km)</Label>
                  <Input
                    id="searchRadiusKm"
                    type="number"
                    step="0.1"
                    placeholder="Es: 5"
                    {...register("searchRadiusKm", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="centerLatitude">Latitudine Centro</Label>
                  <Input
                    id="centerLatitude"
                    type="number"
                    step="0.000001"
                    placeholder="Es: 45.4642"
                    {...register("centerLatitude", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="centerLongitude">Longitudine Centro</Label>
                  <Input
                    id="centerLongitude"
                    type="number"
                    step="0.000001"
                    placeholder="Es: 9.1900"
                    {...register("centerLongitude", { valueAsNumber: true })}
                  />
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* SECTION 3: Budget & Size */}
          <AccordionItem value="budget" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-primary" />
                <span className="font-semibold">Budget & Dimensioni</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">

              {/* Price Range */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceMin">
                    Prezzo Minimo (€) {contractType === "rent" && "al mese"}
                  </Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="Es: 200000"
                    {...register("priceMin", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax">
                    Prezzo Massimo (€) {contractType === "rent" && "al mese"}
                  </Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="Es: 350000"
                    {...register("priceMax", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Square Meters */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sqmMin">Metri Quadri Minimi</Label>
                  <Input
                    id="sqmMin"
                    type="number"
                    placeholder="Es: 60"
                    {...register("sqmMin", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sqmMax">Metri Quadri Massimi</Label>
                  <Input
                    id="sqmMax"
                    type="number"
                    placeholder="Es: 100"
                    {...register("sqmMax", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomsMin">Locali Minimi</Label>
                  <Input
                    id="roomsMin"
                    type="number"
                    placeholder="Es: 2"
                    {...register("roomsMin", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomsMax">Locali Massimi</Label>
                  <Input
                    id="roomsMax"
                    type="number"
                    placeholder="Es: 3"
                    {...register("roomsMax", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedroomsMin">Camere da Letto Minime</Label>
                  <Input
                    id="bedroomsMin"
                    type="number"
                    placeholder="Es: 1"
                    {...register("bedroomsMin", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathroomsMin">Bagni Minimi</Label>
                  <Input
                    id="bathroomsMin"
                    type="number"
                    placeholder="Es: 1"
                    {...register("bathroomsMin", { valueAsNumber: true })}
                  />
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* SECTION 4: Features & Exclusions */}
          <AccordionItem value="features" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="font-semibold">Caratteristiche Richieste</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">

              {/* Required Features */}
              <div>
                <Label className="mb-3 block">Caratteristiche Obbligatorie</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { id: "requiresElevator", label: "Ascensore" },
                    { id: "requiresParking", label: "Parcheggio" },
                    { id: "requiresGarage", label: "Garage" },
                    { id: "requiresGarden", label: "Giardino" },
                    { id: "requiresTerrace", label: "Terrazza" },
                    { id: "requiresBalcony", label: "Balcone" },
                    { id: "requiresCellar", label: "Cantina" },
                    { id: "requiresSwimmingPool", label: "Piscina" },
                  ].map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox id={feature.id} {...register(feature.id as any)} />
                      <Label htmlFor={feature.id} className="cursor-pointer">
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div>
                <Label className="mb-3 block">Esclusioni</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="excludeGroundFloor" {...register("excludeGroundFloor")} />
                    <Label htmlFor="excludeGroundFloor" className="cursor-pointer">
                      Escludi piano terra
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeTopFloorNoElevator"
                      {...register("excludeTopFloorNoElevator")}
                    />
                    <Label htmlFor="excludeTopFloorNoElevator" className="cursor-pointer">
                      Escludi ultimo piano senza ascensore
                    </Label>
                  </div>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>

          {/* SECTION 5: Quality & Timing */}
          <AccordionItem value="quality" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold">Qualità & Tempistiche</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">

              {/* Condition & Energy Class */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minCondition">Condizione Minima</Label>
                  <Select onValueChange={(value) => setValue("minCondition", value)}>
                    <SelectTrigger id="minCondition">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Ottimo</SelectItem>
                      <SelectItem value="good">Buono</SelectItem>
                      <SelectItem value="fair">Abitabile</SelectItem>
                      <SelectItem value="needs_renovation">Da ristrutturare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minEnergyClass">Classe Energetica Minima</Label>
                  <Select onValueChange={(value) => setValue("minEnergyClass", value)}>
                    <SelectTrigger id="minEnergyClass">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Max Year Built */}
              <div className="space-y-2">
                <Label htmlFor="maxYearBuilt">Anno Costruzione Massimo</Label>
                <Input
                  id="maxYearBuilt"
                  type="number"
                  placeholder="Es: 2000 (solo immobili costruiti dopo il 2000)"
                  {...register("maxYearBuilt", { valueAsNumber: true })}
                />
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moveDate">Data Trasferimento Desiderata</Label>
                  <Input id="moveDate" type="date" {...register("moveDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Scadenza Richiesta</Label>
                  <Input id="expiresAt" type="date" {...register("expiresAt")} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Note Aggiuntive</Label>
                <Textarea
                  id="notes"
                  placeholder="Eventuali note o preferenze specifiche del cliente..."
                  rows={4}
                  {...register("notes")}
                />
              </div>

            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    Correggi i seguenti errori:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || selectedCities.length === 0}
          >
            {createMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creazione...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crea Richiesta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
