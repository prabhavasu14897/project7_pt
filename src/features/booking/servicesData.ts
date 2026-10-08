import { productConfig } from "@config/product.config";
import { fillTemplate } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { Schedule } from "./slots";

const { demoData, content, ui } = productConfig;

export type ServiceKind = "doctor" | "home-care" | "package" | "lab-test";
export type ConsultMode = "online" | "clinic";

/** Who delivers the service and when they're free. */
export interface Provider {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  reviews: number;
  schedule: Schedule;
}

/* ---------- doctors ---------- */

export type DoctorRecord = (typeof demoData.doctors)[number];

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  verified: boolean;
  experienceYears: number;
  languages: readonly string[];
  education: readonly string[];
  about: string;
  /** Fee per consult mode the doctor offers, video first. */
  modes: ReadonlyArray<{ mode: ConsultMode; fee: number }>;
  clinic: { name: string; area: string };
  schedule: Schedule;
  href: string;
}

export const doctors: readonly Doctor[] = demoData.doctors.map((doctor) => {
  const consult: { online?: number; clinic?: number } = doctor.consult;
  const modes: Array<{ mode: ConsultMode; fee: number }> = [];
  if (consult.online !== undefined) modes.push({ mode: "online", fee: consult.online });
  if (consult.clinic !== undefined) modes.push({ mode: "clinic", fee: consult.clinic });
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    rating: doctor.rating,
    reviews: doctor.reviews,
    verified: doctor.verified,
    experienceYears: doctor.experienceYears,
    languages: doctor.languages,
    education: doctor.education,
    about: doctor.about,
    modes,
    clinic: doctor.clinic,
    schedule: { slotTimes: doctor.slotTimes, offDays: doctor.offDays },
    href: routes.doctor(doctor.id),
  };
});

export function getDoctor(id: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.id === id);
}

export function lowestFee(doctor: Doctor): number {
  return Math.min(...doctor.modes.map((item) => item.fee));
}

/* ---------- home care ---------- */

export const homeCareProviders: readonly Provider[] = demoData.homeCareProviders.map((provider) => ({
  id: provider.id,
  name: provider.name,
  verified: provider.verified,
  rating: provider.rating,
  reviews: provider.reviews,
  schedule: { slotTimes: provider.slotTimes, offDays: provider.offDays },
}));

export interface HomeCareService {
  id: string;
  name: string;
  category: string;
  description: string;
  includes: readonly string[];
  duration: string;
  price: number;
  /** "/ visit", "/ session", "/ day". */
  unit: string;
  rating: number;
  reviews: number;
  providers: readonly Provider[];
}

export const homeCareServices: readonly HomeCareService[] = demoData.homeCare.map((service) => ({
  id: service.id,
  name: service.name,
  category: service.category,
  description: service.description,
  includes: service.includes,
  duration: service.duration,
  price: service.price,
  unit: ui.units[service.unit],
  rating: service.rating,
  reviews: service.reviews,
  providers: service.providerIds
    .map((providerId) => homeCareProviders.find((provider) => provider.id === providerId))
    .filter((provider): provider is Provider => provider !== undefined),
}));

/* ---------- health packages ---------- */

export interface HealthPackage {
  id: string;
  name: string;
  category: string;
  tests: number;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  reportTime: string;
  preparation: string;
  groups: ReadonlyArray<{ name: string; count: number }>;
  benefits: readonly string[];
  lab: Provider;
  href: string;
}

export const healthPackages: readonly HealthPackage[] = demoData.healthPackages.flatMap((item) => {
  const lab = demoData.labs.find((entry) => entry.id === item.labId);
  if (!lab) return [];
  return [
    {
      id: item.id,
      name: item.name,
      category: item.category,
      tests: item.tests,
      price: item.price,
      mrp: item.mrp,
      rating: item.rating,
      reviews: item.reviews,
      reportTime: item.reportTime,
      preparation: item.preparation,
      groups: item.groups,
      benefits: item.benefits,
      lab: {
        id: lab.id,
        name: lab.name,
        verified: lab.verified,
        rating: lab.rating,
        reviews: lab.reviews,
        schedule: { slotTimes: demoData.collectionSlotTimes, offDays: [] },
      },
      href: routes.healthPackage(item.id),
    },
  ];
});

/** "preventive" → "Preventive". */
export function packageCategoryLabel(value: string): string {
  return content.healthPackages.categories.find((item) => item.value === value)?.label ?? value;
}

export function getHealthPackage(id: string): HealthPackage | undefined {
  return healthPackages.find((item) => item.id === id);
}

/* ---------- one shape for the shared booking page ---------- */

export interface Bookable {
  kind: ServiceKind;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: string;
  providers: readonly Provider[];
  /** Doctors only: the consult modes on offer. */
  modes?: ReadonlyArray<{ mode: ConsultMode; fee: number }>;
  /** Price for a mode (doctors), a provider (lab tests) or the flat price (home care, packages). */
  price: (mode?: ConsultMode, providerId?: string) => number;
  /** Whether the booking needs a home address: home visits, sample collection, and never video consults. */
  needsAddress: (mode?: ConsultMode) => boolean;
  /** Only verified providers can be booked. */
  bookable: boolean;
  /** Where the details live. */
  backHref: string;
  /** Packages: how to prepare, shown beside the slots. */
  preparation?: string;
  /** Packages: list price, for the saving line. */
  mrp?: number;
  /** Lab tests: needs an overnight fast, so same-day collection is closed. */
  fasting?: boolean;
}

/* ---------- lab tests ---------- */

/** A lab as a bookable provider; home collection runs in the morning windows. */
function labProvider(labId: string): Provider | undefined {
  const lab = demoData.labs.find((entry) => entry.id === labId);
  if (!lab) return undefined;
  return {
    id: lab.id,
    name: lab.name,
    verified: lab.verified,
    rating: lab.rating,
    reviews: lab.reviews,
    schedule: { slotTimes: demoData.collectionSlotTimes, offDays: [] },
  };
}

export interface LabOffer {
  lab: Provider;
  price: number;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  popular: boolean;
  parameters: number;
  sampleType: string;
  fasting: boolean;
  reportTime: string;
  description: string;
  includes: readonly string[];
  preparation: string;
  mrp: number;
  rating: number;
  reviews: number;
  /** Every lab offering the test, cheapest first. */
  offers: readonly LabOffer[];
  /** Verified labs only: the ones that can actually be booked. */
  bookableOffers: readonly LabOffer[];
  href: string;
}

export const labTests: readonly LabTest[] = demoData.labTests.map((test) => {
  const offers = test.offers
    .map((offer): LabOffer | undefined => {
      const lab = labProvider(offer.labId);
      return lab ? { lab, price: offer.price } : undefined;
    })
    .filter((offer): offer is LabOffer => offer !== undefined)
    .sort((a, b) => a.price - b.price);
  return {
    id: test.id,
    name: test.name,
    category: test.category,
    popular: test.popular,
    parameters: test.parameters,
    sampleType: test.sampleType,
    fasting: test.fasting,
    reportTime: test.reportTime,
    description: test.description,
    includes: test.includes,
    preparation: test.preparation,
    mrp: test.mrp,
    rating: test.rating,
    reviews: test.reviews,
    offers,
    bookableOffers: offers.filter((offer) => offer.lab.verified),
    href: routes.labTest(test.id),
  };
});

export function getLabTest(id: string): LabTest | undefined {
  return labTests.find((test) => test.id === id);
}

/** "general" → "Fever & general". */
export function labCategoryLabel(value: string): string {
  return content.labTests.categories.find((item) => item.value === value)?.label ?? value;
}

export function getBookable(kind: string, id: string): Bookable | undefined {
  if (kind === "doctor") {
    const doctor = getDoctor(id);
    if (!doctor) return undefined;
    return {
      kind,
      id,
      title: doctor.name,
      subtitle: `${doctor.specialty} · ${fillTemplate(content.doctors.experience, { years: doctor.experienceYears })}`,
      icon: "doctors",
      tone: "doctors",
      providers: [
        { id: doctor.id, name: doctor.name, verified: doctor.verified, rating: doctor.rating, reviews: doctor.reviews, schedule: doctor.schedule },
      ],
      modes: doctor.modes,
      price: (mode) => doctor.modes.find((item) => item.mode === mode)?.fee ?? lowestFee(doctor),
      needsAddress: () => false,
      bookable: doctor.verified,
      backHref: doctor.href,
    };
  }
  if (kind === "home-care") {
    const service = homeCareServices.find((item) => item.id === id);
    if (!service) return undefined;
    return {
      kind,
      id,
      title: service.name,
      subtitle: `${service.duration} · ${service.description}`,
      icon: "home-care",
      tone: "home-care",
      providers: service.providers.filter((provider) => provider.verified),
      price: () => service.price,
      needsAddress: () => true,
      bookable: service.providers.some((provider) => provider.verified),
      backHref: productConfig.categories.find((item) => item.key === "home-care")?.href ?? "/",
    };
  }
  if (kind === "lab-test") {
    const test = getLabTest(id);
    if (!test) return undefined;
    const cheapest = test.bookableOffers[0];
    return {
      kind,
      id,
      title: test.name,
      subtitle: `${test.sampleType} · ${fillTemplate(content.labTests.reportIn, { time: test.reportTime })}`,
      icon: "lab-tests",
      tone: "lab-tests",
      providers: test.bookableOffers.map((offer) => offer.lab),
      price: (_mode, providerId) => test.bookableOffers.find((offer) => offer.lab.id === providerId)?.price ?? cheapest?.price ?? 0,
      needsAddress: () => true,
      bookable: test.bookableOffers.length > 0,
      backHref: test.href,
      preparation: test.preparation,
      mrp: test.mrp,
      fasting: test.fasting,
    };
  }
  if (kind === "package") {
    const item = getHealthPackage(id);
    if (!item) return undefined;
    return {
      kind,
      id,
      title: item.name,
      subtitle: `${fillTemplate(content.healthPackages.testsCount, { count: item.tests })} · ${fillTemplate(content.healthPackages.reportIn, { time: item.reportTime })}`,
      icon: "health-packages",
      tone: "health-packages",
      providers: [item.lab],
      price: () => item.price,
      needsAddress: () => true,
      bookable: item.lab.verified,
      backHref: item.href,
      preparation: item.preparation,
      mrp: item.mrp,
    };
  }
  return undefined;
}
