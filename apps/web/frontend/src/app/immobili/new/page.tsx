"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Ruler,
  Euro,
  FileText,
  CheckCircle,
  AlertCircle,
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { propertiesApi } from "@/lib/api";

const propertySchema = z.object({
  status: z.enum(["draft", "available", "option", "sold", "rented", "suspended", "archived"]).default("available"),
  visibility: z.enum(["public", "private", "network", "archived"]).default("public"),
  contractType: z.enum(["sale", "rent"]),
  propertyType: z.enum(["apartment", "house", "villa", "office", "commercial", "land", "garage", "other"]),
  propertyCategory: z.enum(["residential", "commercial", "industrial"]).default("residential"),
  source: z.enum(["direct_mandate", "census", "web_scraping", "cadastre"]).default("direct_mandate"),
  ownerContactId: z.string().optional(),
  street: z.string().min(1, "Via obbligatoria"),
  civic: z.string().optional(),
  internal: z.string().optional(),
  floor: z.string().optional(),
  city: z.string().min(1, "Città obbligatoria"),
  province: z.string().min(2, "Provincia obbligatoria"),
  zone: z.string().optional(),
  zip: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  sqmCommercial: z.number().min(1, "Metratura obbligatoria"),
  sqmLivable: z.number().optional(),
  rooms: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  condition: z.enum(["excellent", "good", "fair", "needs_renovation"]).optional(),
  heatingType: z.enum(["autonomous", "centralized", "floor", "heat_pump", "none"]).optional(),
  energyClass: z.enum(["A+", "A", "B", "C", "D", "E", "F", "G"]).optional(),
  yearBuilt: z.number().optional(),
  yearRenovated: z.number().optional(),
  hasElevator: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasCellar: z.boolean().default(false),
  hasAttic: z.boolean().default(false),
  hasSwimmingPool: z.boolean().default(false),
  hasFireplace: z.boolean().default(false),
  hasAlarm: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  hasProfessionalPhotos: z.boolean().default(false),
  hasVirtualTour: z.boolean().default(false),
  has3DModel: z.boolean().default(false),
  hasFloorPlan: z.boolean().default(false),
  priceSale: z.number().optional(),
  priceRentMonthly: z.number().optional(),
  priceMinAcceptable: z.number().optional(),
  condominiumFees: z.number().optional(),
  mandateType: z.enum(["exclusive", "simple", "verbal"]).optional(),
  mandateNumber: z.string().optional(),
  mandateStartDate: z.string().optional(),
  mandateEndDate: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  needsInternalVisit: z.boolean().default(false),
  needsPhotos: z.boolean().default(false),
  needsValuation: z.boolean().default(false),
  ownerToContact: z.boolean().default(false),
  verified: z.boolean().default(false),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: { status: "available", visibility: "public", contractType: "sale", propertyType: "apartment" },
  });
  const contractType = watch("contractType");
  const { data: contactsData } = useQuery({ queryKey: ["contacts"], queryFn: async () => { const r = await fetch("/api/contacts?status=active"); return r.json(); } });
  const contacts = contactsData?.contacts || [];
  const createMutation = useMutation({ mutationFn: async (data: PropertyFormData) => await propertiesApi.create(data), onSuccess: (r) => router.push(`/immobili/${r.property.id}`) });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Nuovo Immobile</h1><p className="text-muted-foreground">Form completo con tutti i campi</p></div>
        <Button variant="outline" onClick={() => router.back()}><X className="h-4 w-4 mr-2" />Annulla</Button>
      </div>
      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        <Accordion type="multiple" defaultValue={["base","location","technical"]} className="space-y-4">
          <AccordionItem value="base" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><Building2 className="h-5 w-5 text-primary"/><span className="font-semibold">Base</span><Badge variant="destructive">*</Badge></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Stato</Label><Select defaultValue="available" onValueChange={v=>setValue("status",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="draft">Bozza</SelectItem><SelectItem value="available">Disponibile</SelectItem><SelectItem value="sold">Venduto</SelectItem></SelectContent></Select></div>
                <div><Label>Contratto</Label><Select defaultValue="sale" onValueChange={v=>setValue("contractType",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sale">Vendita</SelectItem><SelectItem value="rent">Affitto</SelectItem></SelectContent></Select></div>
                <div><Label>Tipo</Label><Select defaultValue="apartment" onValueChange={v=>setValue("propertyType",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="apartment">Appartamento</SelectItem><SelectItem value="house">Casa</SelectItem><SelectItem value="villa">Villa</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Proprietario</Label><Select onValueChange={v=>setValue("ownerContactId",v)}><SelectTrigger><SelectValue placeholder="Seleziona..."/></SelectTrigger><SelectContent>{contacts.map((c:any)=><SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}</SelectContent></Select></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="location" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><MapPin className="h-5 w-5 text-primary"/><span className="font-semibold">Indirizzo</span><Badge variant="destructive">*</Badge></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2"><Label>Via *</Label><Input {...register("street")}/>{errors.street&&<p className="text-sm text-destructive">{errors.street.message}</p>}</div>
                <div><Label>Civico</Label><Input {...register("civic")}/></div>
                <div><Label>Interno</Label><Input {...register("internal")} placeholder="int.3"/></div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div><Label>Piano</Label><Input {...register("floor")} placeholder="3"/></div>
                <div><Label>Città *</Label><Input {...register("city")}/>{errors.city&&<p className="text-sm text-destructive">{errors.city.message}</p>}</div>
                <div><Label>Provincia *</Label><Input {...register("province")}/>{errors.province&&<p className="text-sm text-destructive">{errors.province.message}</p>}</div>
                <div><Label>CAP</Label><Input {...register("zip")} placeholder="20121"/></div>
              </div>
              <div><Label>Zona</Label><Input {...register("zone")} placeholder="Centro"/></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="technical" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><Ruler className="h-5 w-5 text-primary"/><span className="font-semibold">Tecnico</span><Badge variant="destructive">*</Badge></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Mq Commerciali *</Label><Input type="number" step="0.1" {...register("sqmCommercial",{valueAsNumber:true})}/>{errors.sqmCommercial&&<p className="text-sm text-destructive">{errors.sqmCommercial.message}</p>}</div>
                <div><Label>Mq Abitabili</Label><Input type="number" step="0.1" {...register("sqmLivable",{valueAsNumber:true})}/></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Locali</Label><Input type="number" {...register("rooms",{valueAsNumber:true})}/></div>
                <div><Label>Camere</Label><Input type="number" {...register("bedrooms",{valueAsNumber:true})}/></div>
                <div><Label>Bagni</Label><Input type="number" {...register("bathrooms",{valueAsNumber:true})}/></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label>Condizione</Label><Select onValueChange={v=>setValue("condition",v as any)}><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent><SelectItem value="excellent">Ottimo</SelectItem><SelectItem value="good">Buono</SelectItem><SelectItem value="fair">Abitabile</SelectItem><SelectItem value="needs_renovation">Da ristrutturare</SelectItem></SelectContent></Select></div>
                <div><Label>Riscaldamento</Label><Select onValueChange={v=>setValue("heatingType",v as any)}><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent><SelectItem value="autonomous">Autonomo</SelectItem><SelectItem value="centralized">Centralizzato</SelectItem></SelectContent></Select></div>
                <div><Label>Classe Energetica</Label><Select onValueChange={v=>setValue("energyClass",v as any)}><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent>{["A+","A","B","C","D","E","F","G"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Anno Costruzione</Label><Input type="number" {...register("yearBuilt",{valueAsNumber:true})}/></div>
                <div><Label>Anno Ristrutturazione</Label><Input type="number" {...register("yearRenovated",{valueAsNumber:true})}/></div>
              </div>
              <div><Label className="mb-3 block">Dotazioni</Label><div className="grid md:grid-cols-3 gap-3">{[{id:"hasElevator",label:"Ascensore"},{id:"hasParking",label:"Parcheggio"},{id:"hasGarage",label:"Garage"},{id:"hasGarden",label:"Giardino"},{id:"hasTerrace",label:"Terrazza"},{id:"hasBalcony",label:"Balcone"},{id:"hasCellar",label:"Cantina"},{id:"hasAttic",label:"Soffitta"},{id:"hasSwimmingPool",label:"Piscina"},{id:"hasFireplace",label:"Camino"},{id:"hasAlarm",label:"Allarme"},{id:"hasAirConditioning",label:"Aria condizionata"}].map(f=><div key={f.id} className="flex items-center space-x-2"><Checkbox id={f.id} {...register(f.id as any)}/><Label htmlFor={f.id}>{f.label}</Label></div>)}</div></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="pricing" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><Euro className="h-5 w-5 text-primary"/><span className="font-semibold">Prezzi</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">{contractType==="sale"?<><div><Label>Prezzo Vendita (€)</Label><Input type="number" {...register("priceSale",{valueAsNumber:true})}/></div><div><Label>Prezzo Min Accettabile (€)</Label><Input type="number" {...register("priceMinAcceptable",{valueAsNumber:true})}/></div></>:<div><Label>Canone Mensile (€)</Label><Input type="number" {...register("priceRentMonthly",{valueAsNumber:true})}/></div>}<div><Label>Spese Cond. (€/mese)</Label><Input type="number" {...register("condominiumFees",{valueAsNumber:true})}/></div></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Tipo Mandato</Label><Select onValueChange={v=>setValue("mandateType",v as any)}><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent><SelectItem value="exclusive">Esclusiva</SelectItem><SelectItem value="simple">Semplice</SelectItem><SelectItem value="verbal">Verbale</SelectItem></SelectContent></Select></div>
                <div><Label>Numero Mandato</Label><Input {...register("mandateNumber")} placeholder="MAND-2024-001"/></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Data Inizio Mandato</Label><Input type="date" {...register("mandateStartDate")}/></div>
                <div><Label>Data Fine Mandato</Label><Input type="date" {...register("mandateEndDate")}/></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="marketing" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><FileText className="h-5 w-5 text-primary"/><span className="font-semibold">Marketing</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div><Label>Titolo Annuncio</Label><Input {...register("title")} placeholder="Luminoso bilocale..."/></div>
              <div><Label>Descrizione</Label><Textarea {...register("description")} rows={6}/></div>
              <div><Label>Note Pubbliche</Label><Textarea {...register("notes")} rows={3}/></div>
              <div><Label>Note Interne</Label><Textarea {...register("internalNotes")} rows={3}/></div>
              <div><Label className="mb-3 block">Media</Label><div className="grid md:grid-cols-2 gap-3">{[{id:"hasProfessionalPhotos",label:"Foto professionali"},{id:"hasVirtualTour",label:"Tour virtuale"},{id:"has3DModel",label:"Modello 3D"},{id:"hasFloorPlan",label:"Planimetria"}].map(f=><div key={f.id} className="flex items-center space-x-2"><Checkbox id={f.id} {...register(f.id as any)}/><Label htmlFor={f.id}>{f.label}</Label></div>)}</div></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="census" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><CheckCircle className="h-5 w-5 text-primary"/><span className="font-semibold">Censimento</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4"><div className="space-y-3">{[{id:"needsInternalVisit",label:"Richiede visita"},{id:"needsPhotos",label:"Richiede foto"},{id:"needsValuation",label:"Richiede valutazione"},{id:"ownerToContact",label:"Proprietario da contattare"},{id:"verified",label:"Verificato"}].map(f=><div key={f.id} className="flex items-center space-x-2"><Checkbox id={f.id} {...register(f.id as any)}/><Label htmlFor={f.id}>{f.label}</Label></div>)}</div></AccordionContent>
          </AccordionItem>
        </Accordion>
        {Object.keys(errors).length>0&&<Card className="border-destructive"><CardContent className="pt-6"><div className="flex items-start gap-3"><AlertCircle className="h-5 w-5 text-destructive mt-0.5"/><div><h3 className="font-semibold text-destructive mb-2">Errori:</h3><ul className="list-disc list-inside space-y-1 text-sm">{Object.entries(errors).map(([f,e])=><li key={f}>{e.message}</li>)}</ul></div></div></CardContent></Card>}
        <div className="flex gap-4 justify-end sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border">
          <Button type="button" variant="outline" onClick={()=>router.back()}>Annulla</Button>
          <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending?<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"/>Creazione...</>:<><Save className="h-4 w-4 mr-2"/>Crea Immobile</>}</Button>
        </div>
      </form>
    </div>
  );
}
