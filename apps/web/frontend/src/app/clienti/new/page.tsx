"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { User, MapPin, FileText, Shield, TrendingUp, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const contactSchema = z.object({
  entityType: z.enum(["person", "company"]).default("person"),
  fullName: z.string().min(1, "Nome obbligatorio"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  primaryPhone: z.string().optional(),
  secondaryPhone: z.string().optional(),
  primaryEmail: z.string().email("Email non valida").optional().or(z.literal("")),
  secondaryEmail: z.string().email("Email non valida").optional().or(z.literal("")),
  street: z.string().optional(),
  civic: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().default("Italia"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  taxCode: z.string().optional(),
  vatNumber: z.string().optional(),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  privacyFirstContact: z.boolean().default(false),
  privacyExtended: z.boolean().default(false),
  privacyMarketing: z.boolean().default(false),
  source: z.enum(["website", "referral", "cold_call", "census", "portal", "other"]).optional(),
  leadScore: z.number().min(0).max(100).optional(),
  importance: z.enum(["low", "normal", "high", "vip"]).default("normal"),
  status: z.enum(["active", "inactive", "converted", "archived"]).default("active"),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { entityType: "person", country: "Italia", importance: "normal", status: "active" },
  });
  const entityType = watch("entityType");
  const createMutation = useMutation({ mutationFn: async (d: ContactFormData) => await api.contacts.create(d), onSuccess: (r) => router.push(`/clienti/${r.contact.id}`) });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Nuovo Cliente</h1><p className="text-muted-foreground">Form completo con tutti i campi</p></div>
        <Button variant="outline" onClick={() => router.back()}><X className="h-4 w-4 mr-2" />Annulla</Button>
      </div>
      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        <Accordion type="multiple" defaultValue={["base","contacts"]} className="space-y-4">
          <AccordionItem value="base" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><User className="h-5 w-5 text-primary"/><span className="font-semibold">Informazioni Base</span><Badge variant="destructive">*</Badge></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Tipo Entità</Label><Select defaultValue="person" onValueChange={v=>setValue("entityType",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="person">Persona</SelectItem><SelectItem value="company">Azienda</SelectItem></SelectContent></Select></div>
                <div><Label>Importanza</Label><Select defaultValue="normal" onValueChange={v=>setValue("importance",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Bassa</SelectItem><SelectItem value="normal">Normale</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="vip">VIP</SelectItem></SelectContent></Select></div>
              </div>
              {entityType==="person"?<div className="grid md:grid-cols-3 gap-4">
                <div><Label>Nome *</Label><Input {...register("firstName")}/></div>
                <div><Label>Cognome *</Label><Input {...register("lastName")}/></div>
                <div><Label>Nome Completo *</Label><Input {...register("fullName")}/>{errors.fullName&&<p className="text-sm text-destructive">{errors.fullName.message}</p>}</div>
              </div>:<div><Label>Ragione Sociale *</Label><Input {...register("companyName")}/><Input {...register("fullName")} className="mt-2" placeholder="Nome completo"/>{errors.fullName&&<p className="text-sm text-destructive">{errors.fullName.message}</p>}</div>}
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Stato</Label><Select defaultValue="active" onValueChange={v=>setValue("status",v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="active">Attivo</SelectItem><SelectItem value="inactive">Inattivo</SelectItem><SelectItem value="converted">Convertito</SelectItem><SelectItem value="archived">Archiviato</SelectItem></SelectContent></Select></div>
                <div><Label>Sorgente</Label><Select onValueChange={v=>setValue("source",v as any)}><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent><SelectItem value="website">Sito web</SelectItem><SelectItem value="referral">Passaparola</SelectItem><SelectItem value="cold_call">Chiamata fredda</SelectItem><SelectItem value="census">Censimento</SelectItem><SelectItem value="portal">Portale</SelectItem></SelectContent></Select></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="contacts" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><MapPin className="h-5 w-5 text-primary"/><span className="font-semibold">Contatti</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Telefono Principale</Label><Input {...register("primaryPhone")} placeholder="+39 333 1234567"/></div>
                <div><Label>Telefono Secondario</Label><Input {...register("secondaryPhone")} placeholder="+39 340 9876543"/></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Email Principale</Label><Input type="email" {...register("primaryEmail")}/>{errors.primaryEmail&&<p className="text-sm text-destructive">{errors.primaryEmail.message}</p>}</div>
                <div><Label>Email Secondaria</Label><Input type="email" {...register("secondaryEmail")}/>{errors.secondaryEmail&&<p className="text-sm text-destructive">{errors.secondaryEmail.message}</p>}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="address" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><MapPin className="h-5 w-5 text-primary"/><span className="font-semibold">Indirizzo</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2"><Label>Via</Label><Input {...register("street")} placeholder="Via Roma"/></div>
                <div><Label>Civico</Label><Input {...register("civic")} placeholder="10"/></div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div><Label>Città</Label><Input {...register("city")} placeholder="Milano"/></div>
                <div><Label>Provincia</Label><Input {...register("province")} placeholder="MI"/></div>
                <div><Label>CAP</Label><Input {...register("zip")} placeholder="20121"/></div>
                <div><Label>Paese</Label><Input {...register("country")} defaultValue="Italia"/></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="fiscal" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><FileText className="h-5 w-5 text-primary"/><span className="font-semibold">Dati Fiscali</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Codice Fiscale</Label><Input {...register("taxCode")} placeholder="RSSMRA80A01F205X"/></div>
                <div><Label>Partita IVA</Label><Input {...register("vatNumber")} placeholder="12345678901"/></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Data di Nascita</Label><Input type="date" {...register("birthDate")}/></div>
                <div><Label>Nazionalità</Label><Input {...register("nationality")} placeholder="Italiana"/></div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacy" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><Shield className="h-5 w-5 text-primary"/><span className="font-semibold">Privacy GDPR</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4"><div className="space-y-3">{[{id:"privacyFirstContact",label:"Consenso primo contatto"},{id:"privacyExtended",label:"Consenso esteso"},{id:"privacyMarketing",label:"Consenso marketing"}].map(f=><div key={f.id} className="flex items-center space-x-2"><Checkbox id={f.id} {...register(f.id as any)}/><Label htmlFor={f.id}>{f.label}</Label></div>)}</div></AccordionContent>
          </AccordionItem>
          <AccordionItem value="profiling" className="border rounded-lg">
            <AccordionTrigger className="px-4"><div className="flex gap-2"><TrendingUp className="h-5 w-5 text-primary"/><span className="font-semibold">Profiling & Budget</span></div></AccordionTrigger>
            <AccordionContent className="px-4 pt-4 space-y-4">
              <div><Label>Lead Score (0-100)</Label><Input type="number" min="0" max="100" {...register("leadScore",{valueAsNumber:true})} placeholder="75"/></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Budget Minimo (€)</Label><Input type="number" {...register("budgetMin",{valueAsNumber:true})} placeholder="200000"/></div>
                <div><Label>Budget Massimo (€)</Label><Input type="number" {...register("budgetMax",{valueAsNumber:true})} placeholder="350000"/></div>
              </div>
              <div><Label>Note</Label><Textarea {...register("notes")} rows={4} placeholder="Note sul cliente..."/></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex gap-4 justify-end sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border">
          <Button type="button" variant="outline" onClick={()=>router.back()}>Annulla</Button>
          <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending?<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"/>Creazione...</>:<><Save className="h-4 w-4 mr-2"/>Crea Cliente</>}</Button>
        </div>
      </form>
    </div>
  );
}
