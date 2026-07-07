import { PrismaClient, ThemeCategory, Sentiment, SubmissionChannel, FeedbackStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedRecommendation {
  cat: string;
  t: { title: string; desc: string; cost: number };
  count: number;
  demand: number;
  impact: number;
  priority: number;
}

const SAMPLE_FEEDBACK = [
  { content: 'Our village road has potholes everywhere. Need urgent repair.', theme: 'Road Infrastructure', category: ThemeCategory.ROAD_INFRASTRUCTURE, lat: 28.6139, lng: 77.209, district: 'Central Delhi', sentiment: Sentiment.URGENT },
  { content: 'No proper drinking water supply for 3 months. Pipeline is broken.', theme: 'Water Supply', category: ThemeCategory.WATER_SUPPLY, lat: 28.7041, lng: 77.1025, district: 'West Delhi', sentiment: Sentiment.URGENT },
  { content: 'Government school building is damaged. Children study in unsafe conditions.', theme: 'Education', category: ThemeCategory.EDUCATION, lat: 28.5355, lng: 77.391, district: 'South Delhi', sentiment: Sentiment.NEGATIVE },
  { content: 'Need vocational training centre for unemployed youth in our area.', theme: 'Employment', category: ThemeCategory.EMPLOYMENT, lat: 28.6692, lng: 77.4538, district: 'East Delhi', sentiment: Sentiment.NEUTRAL },
  { content: 'Primary health centre lacks doctors and medicines.', theme: 'Healthcare', category: ThemeCategory.HEALTHCARE, lat: 28.7041, lng: 77.209, district: 'North Delhi', sentiment: Sentiment.NEGATIVE },
  { content: 'Bus service to our village is very limited. Need more routes.', theme: 'Public Transport', category: ThemeCategory.PUBLIC_TRANSPORT, lat: 28.4595, lng: 77.0266, district: 'South West Delhi', sentiment: Sentiment.NEUTRAL },
  { content: 'Frequent power cuts affecting farmers irrigation pumps.', theme: 'Electricity', category: ThemeCategory.ELECTRICITY, lat: 28.5921, lng: 77.046, district: 'South West Delhi', sentiment: Sentiment.NEGATIVE },
  { content: 'Garbage dump near residential area causing health hazards.', theme: 'Sanitation', category: ThemeCategory.SANITATION, lat: 28.6139, lng: 77.209, district: 'Central Delhi', sentiment: Sentiment.URGENT },
  { content: 'Irrigation canal needs repair before monsoon season.', theme: 'Agriculture', category: ThemeCategory.AGRICULTURE, lat: 28.6692, lng: 77.4538, district: 'East Delhi', sentiment: Sentiment.NEUTRAL },
  { content: 'सड़क की मरम्मत जरूरी है। गड्ढे बहुत हैं।', theme: 'Road Infrastructure', category: ThemeCategory.ROAD_INFRASTRUCTURE, lat: 28.7041, lng: 77.1025, district: 'West Delhi', sentiment: Sentiment.URGENT },
  { content: 'School needs more teachers and computer lab.', theme: 'Education', category: ThemeCategory.EDUCATION, lat: 28.5355, lng: 77.391, district: 'South Delhi', sentiment: Sentiment.NEUTRAL },
  { content: 'Water tanker comes only once a week. Not enough for families.', theme: 'Water Supply', category: ThemeCategory.WATER_SUPPLY, lat: 28.6692, lng: 77.4538, district: 'East Delhi', sentiment: Sentiment.NEGATIVE },
  { content: 'Road repair required near market area.', theme: 'Road Infrastructure', category: ThemeCategory.ROAD_INFRASTRUCTURE, lat: 28.6139, lng: 77.209, district: 'Central Delhi', sentiment: Sentiment.NEUTRAL },
  { content: 'Potholes on main highway causing accidents.', theme: 'Road Infrastructure', category: ThemeCategory.ROAD_INFRASTRUCTURE, lat: 28.7041, lng: 77.209, district: 'North Delhi', sentiment: Sentiment.URGENT },
  { content: 'Need better roads connecting to district hospital.', theme: 'Road Infrastructure', category: ThemeCategory.ROAD_INFRASTRUCTURE, lat: 28.4595, lng: 77.0266, district: 'South West Delhi', sentiment: Sentiment.NEGATIVE },
];

async function main() {
  console.log('Seeding database...');

  const mpPassword = await bcrypt.hash('mp123456', 10);
  const constituency = await prisma.constituency.upsert({
    where: { id: 'const-delhi-north' },
    update: {},
    create: {
      id: 'const-delhi-north',
      name: 'Delhi North',
      state: 'Delhi',
      district: 'Delhi',
      mpName: 'Demo MP',
      population: 2500000,
      literacyRate: 87.5,
    },
  });

  const districtData = [
    { name: 'Central Delhi', pop: 580000, literacy: 88, schools: 45000, hospitals: 12, road: 45, water: 72, employment: 68, lat: 28.6139, lng: 77.209 },
    { name: 'West Delhi', pop: 420000, literacy: 85, schools: 38000, hospitals: 8, road: 38, water: 55, employment: 62, lat: 28.7041, lng: 77.1025 },
    { name: 'South Delhi', pop: 510000, literacy: 91, schools: 52000, hospitals: 15, road: 62, water: 80, employment: 75, lat: 28.5355, lng: 77.391 },
    { name: 'East Delhi', pop: 390000, literacy: 82, schools: 35000, hospitals: 6, road: 35, water: 48, employment: 58, lat: 28.6692, lng: 77.4538 },
    { name: 'North Delhi', pop: 440000, literacy: 84, schools: 40000, hospitals: 10, road: 42, water: 65, employment: 64, lat: 28.7041, lng: 77.209 },
    { name: 'South West Delhi', pop: 360000, literacy: 80, schools: 32000, hospitals: 5, road: 30, water: 42, employment: 55, lat: 28.4595, lng: 77.0266 },
  ];

  const districts: Record<string, string> = {};
  for (const d of districtData) {
    const district = await prisma.district.upsert({
      where: { id: `dist-${d.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `dist-${d.name.toLowerCase().replace(/\s/g, '-')}`,
        name: d.name,
        constituencyId: constituency.id,
        population: d.pop,
        literacyRate: d.literacy,
        schoolEnrollment: d.schools,
        hospitalCount: d.hospitals,
        roadConditionIndex: d.road,
        waterCoverage: d.water,
        employmentRate: d.employment,
        latitude: d.lat,
        longitude: d.lng,
      },
    });
    districts[d.name] = district.id;

    await prisma.publicDataset.create({
      data: {
        name: `${d.name} Census Data 2021`,
        category: 'CENSUS',
        source: 'Census of India',
        districtId: district.id,
        data: {
          population: d.pop,
          literacyRate: d.literacy,
          schoolEnrollment: d.schools,
          hospitalCount: d.hospitals,
        },
      },
    });
  }

  await prisma.user.upsert({
    where: { email: 'mp@demo.gov.in' },
    update: {},
    create: {
      email: 'mp@demo.gov.in',
      password: mpPassword,
      name: 'Demo MP',
      role: 'MP',
      constituencyId: constituency.id,
    },
  });

  const themes: Record<string, string> = {};
  const themeNames = [...new Set(SAMPLE_FEEDBACK.map((f) => f.theme))];
  for (const name of themeNames) {
    const sample = SAMPLE_FEEDBACK.find((f) => f.theme === name)!;
    const theme = await prisma.theme.upsert({
      where: { name },
      update: {},
      create: {
        name,
        category: sample.category,
        keywords: name.toLowerCase().split(' '),
      },
    });
    themes[name] = theme.id;
  }

  for (let i = 0; i < SAMPLE_FEEDBACK.length; i++) {
    const f = SAMPLE_FEEDBACK[i];
    const daysAgo = Math.floor(Math.random() * 25);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await prisma.feedback.create({
      data: {
        rawContent: f.content,
        processedContent: f.content,
        detectedLanguage: f.content.match(/[\u0900-\u097F]/) ? 'hi' : 'en',
        channel: i % 3 === 0 ? SubmissionChannel.WHATSAPP : i % 3 === 1 ? SubmissionChannel.MOBILE : SubmissionChannel.WEB,
        submissionType: 'TEXT',
        status: FeedbackStatus.PROCESSED,
        sentiment: f.sentiment,
        themeId: themes[f.theme],
        keywords: f.content.toLowerCase().split(/\s+/).slice(0, 5),
        latitude: f.lat + (Math.random() - 0.5) * 0.05,
        longitude: f.lng + (Math.random() - 0.5) * 0.05,
        locationName: f.district,
        districtId: districts[f.district],
        constituencyId: constituency.id,
        isAnonymous: true,
        aiSummary: `Citizen reports ${f.theme.toLowerCase()} issue in ${f.district}.`,
        createdAt,
      },
    });
  }

  for (const theme of await prisma.theme.findMany()) {
    const count = await prisma.feedback.count({ where: { themeId: theme.id } });
    await prisma.theme.update({ where: { id: theme.id }, data: { feedbackCount: count } });
  }

  // Generate initial recommendations
  const themeCounts = new Map<string, number>();
  const allFeedback = await prisma.feedback.findMany({ include: { theme: true } });
  for (const f of allFeedback) {
    const cat = f.theme?.category || 'OTHER';
    themeCounts.set(cat, (themeCounts.get(cat) || 0) + 1);
  }
  const maxCount = Math.max(...themeCounts.values(), 1);
  const templates: Record<string, { title: string; desc: string; cost: number }> = {
    ROAD_INFRASTRUCTURE: { title: 'Road Repair & Upgrade', desc: 'Repair potholes in high-demand areas', cost: 60 },
    WATER_SUPPLY: { title: 'Water Pipeline Extension', desc: 'Extend drinking water to underserved villages', cost: 50 },
    EDUCATION: { title: 'School Infrastructure Upgrade', desc: 'Upgrade government schools', cost: 70 },
    HEALTHCARE: { title: 'Primary Health Centre Upgrade', desc: 'Strengthen PHC facilities', cost: 65 },
    PUBLIC_TRANSPORT: { title: 'Bus Service Expansion', desc: 'Add rural bus routes', cost: 55 },
    EMPLOYMENT: { title: 'Vocational Training Centre', desc: 'Skill development for youth', cost: 75 },
    ELECTRICITY: { title: 'Power Infrastructure Upgrade', desc: 'Stabilize power supply', cost: 45 },
    SANITATION: { title: 'Sanitation & Drainage Project', desc: 'Improve waste management', cost: 40 },
    AGRICULTURE: { title: 'Irrigation Canal Repair', desc: 'Repair irrigation canals', cost: 50 },
    OTHER: { title: 'General Development Project', desc: 'Miscellaneous requests', cost: 50 },
  };
  const recs: SeedRecommendation[] = [];
  for (const [cat, count] of themeCounts) {
    const t = templates[cat] || templates.OTHER;
    const demand = Math.min(100, (count / maxCount) * 100);
    const impact = Math.min(100, demand * 0.8 + 20);
    const priority = Math.round(demand * 0.35 + impact * 0.25 + (100 - t.cost) * 0.15 + 70 * 0.15 + 60 * 0.1);
    recs.push({ cat, t, count, demand, impact, priority });
  }
  recs.sort((a, b) => b.priority - a.priority);
  for (let i = 0; i < recs.length; i++) {
    const { cat, t, count, demand, impact, priority } = recs[i];
    await prisma.projectRecommendation.create({
      data: {
        title: t.title,
        description: t.desc,
        themeCategory: cat as any,
        constituencyId: constituency.id,
        demandScore: Math.round(demand),
        impactScore: Math.round(impact),
        costScore: t.cost,
        budgetScore: 70,
        planAlignmentScore: 60,
        priorityScore: priority,
        citizenRequestCount: count,
        estimatedCost: t.cost <= 50 ? 'Medium' : 'High',
        rationale: `${count} citizen requests. Priority based on demand and infrastructure gaps.`,
        rank: i + 1,
      },
    });
  }

  console.log('Seed complete!');
  console.log(`Constituency: ${constituency.name} (${constituency.id})`);
  console.log('MP login: mp@demo.gov.in / mp123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
