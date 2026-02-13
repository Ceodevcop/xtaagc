// staff/staff-data.js
import { db } from '../firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Complete staff data (22 ranks)
export const STAFF_DATA = [
    // RANK 1: CEO
    {
        id: 'rank-01',
        rank: 1,
        name: 'Ahmad Hamza',
        role: 'Chief Executive Officer & Founder',
        category: 'executive',
        tier: 1,
        tierName: 'Tier 1 • Gold',
        bio: '15+ years global trade. Established presence across 50+ countries. Visionary leader in agricultural commodities, ICT infrastructure, and global investment.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
        initials: 'AH',
        email: 'priahmz@gmail.com',
        phone: '+234 802 356 6143',
        social: { linkedin: '#', twitter: '#' },
        location: 'Global HQ',
        since: 2009,
        experience: '15+ years',
        countries: 50,
        featured: true,
        hiring: false,
        tags: ['founder', 'ceo', 'visionary']
    },
    // RANK 2: Group President (Vacant)
    {
        id: 'rank-02',
        rank: 2,
        name: 'Position Vacant',
        role: 'Group President & COO',
        category: 'executive',
        tier: 1,
        tierName: 'Tier 1 • Gold',
        bio: 'Executive leadership opportunity. Seeking experienced leader to drive global operations and sector integration across five core sectors.',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
        initials: 'VP',
        email: 'careers@taagc.com',
        hiring: true,
        hiringNote: 'Now hiring',
        tags: ['hiring', 'executive'],
        featured: false
    },
    // RANK 3: EVP (Vacant)
    {
        id: 'rank-03',
        rank: 3,
        name: 'Strategic Hire',
        role: 'EVP, Global Strategy',
        category: 'executive',
        tier: 1,
        tierName: 'Tier 1 • Gold',
        bio: 'Seeking executive to lead corporate strategy, M&A, and investor relations. Institutional experience required.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        initials: 'SH',
        email: 'careers@taagc.com',
        hiring: true,
        hiringNote: 'Strategic hire',
        tags: ['hiring', 'executive', 'strategy'],
        featured: false
    },
    // RANK 4: SVP African Operations
    {
        id: 'rank-04',
        rank: 4,
        name: 'Dr. Elizabeth Mwangi',
        role: 'SVP, African Operations',
        category: 'executive',
        tier: 1,
        tierName: 'Tier 1 • Gold',
        bio: 'PhD in Agricultural Economics. Leading TAAGC\'s expansion across 15 African countries. 200K+ hectares under management.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        initials: 'EM',
        email: 'e.mwangi@taagc.com',
        social: { linkedin: '#' },
        location: 'Nairobi, Kenya',
        since: 2018,
        experience: '12+ years',
        countries: 15,
        featured: true,
        tags: ['phd', 'agriculture', 'africa']
    },
    // RANK 5: VP Finance
    {
        id: 'rank-05',
        rank: 5,
        name: 'Michael Okafor',
        role: 'VP, Finance & Investment',
        category: 'executive',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: 'CFA, MBA. 12 years in investment banking. Manages $2.1B AUM across TAAGC investment portfolio.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        initials: 'MO',
        email: 'm.okafor@taagc.com',
        social: { linkedin: '#' },
        location: 'Lagos, Nigeria',
        since: 2019,
        experience: '12+ years',
        aum: '$2.1B',
        tags: ['cfa', 'finance', 'investment']
    },
    // RANK 6: AVP Digital
    {
        id: 'rank-06',
        rank: 6,
        name: 'Sarah Chen',
        role: 'AVP, Digital Transformation',
        category: 'executive',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: 'Former AWS solutions architect. Leading ICT infrastructure deployment across 150+ enterprise clients.',
        image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&h=400&fit=crop',
        initials: 'SC',
        email: 's.chen@taagc.com',
        social: { linkedin: '#', github: '#' },
        location: 'Singapore',
        since: 2020,
        clients: 150,
        tags: ['aws', 'ict', 'digital']
    },
    // RANK 7: Director General MENA
    {
        id: 'rank-07',
        rank: 7,
        name: 'Ahmed Hassan',
        role: 'Director General, MENA Region',
        category: 'operations',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: 'Former diplomatic attaché. Leading TAAGC\'s expansion in Middle East and North Africa. Sovereign wealth fund relationships.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        initials: 'AH',
        email: 'a.hassan@taagc.com',
        social: { linkedin: '#' },
        location: 'Dubai, UAE',
        since: 2021,
        region: 'MENA',
        tags: ['diplomacy', 'mena', 'sovereign']
    },
    // RANK 8: Deputy Director Infrastructure
    {
        id: 'rank-08',
        rank: 8,
        name: 'Col. (Rtd) James Otieno',
        role: 'Deputy Director, Infrastructure',
        category: 'operations',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: '25 years military logistics experience. Oversees $450M infrastructure portfolio across 12 countries.',
        image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop',
        initials: 'JO',
        email: 'j.otieno@taagc.com',
        social: { linkedin: '#' },
        location: 'Nairobi, Kenya',
        since: 2017,
        portfolio: '$450M',
        tags: ['military', 'logistics', 'infrastructure']
    },
    // RANK 9: Major Agriculture
    {
        id: 'rank-09',
        rank: 9,
        name: 'Grace Ndlovu',
        role: 'Major • Senior Director, Agriculture',
        category: 'operations',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: 'Agronomist specializing in sustainable farming. Manages 200K+ hectares across 5 countries. 40% efficiency improvement.',
        image: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&h=400&fit=crop',
        initials: 'GN',
        email: 'g.ndlovu@taagc.com',
        social: { linkedin: '#' },
        location: 'Harare, Zimbabwe',
        since: 2016,
        hectares: '200K+',
        tags: ['agronomy', 'sustainable', 'farming']
    },
    // RANK 10: Captain Grain
    {
        id: 'rank-10',
        rank: 10,
        name: 'Ibrahim Diallo',
        role: 'Captain • Director, Grain Processing',
        category: 'operations',
        tier: 2,
        tierName: 'Tier 2 • Silver',
        bio: 'Milling engineer with 12 plants across West Africa. 2M MT annual capacity, 500K MT storage network.',
        image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop',
        initials: 'ID',
        email: 'i.diallo@taagc.com',
        social: { linkedin: '#' },
        location: 'Bamako, Mali',
        since: 2018,
        capacity: '2M MT',
        tags: ['milling', 'grain', 'processing']
    },
    // RANK 11: Lieutenant ICT
    {
        id: 'rank-11',
        rank: 11,
        name: 'Fatima Al-Zahra',
        role: 'Lieutenant • Deputy Director, ICT',
        category: 'operations',
        tier: 3,
        tierName: 'Tier 3 • Bronze',
        bio: 'Cybersecurity expert. CISSP, CISM certified. Leads cloud migration and security operations for 150+ enterprise clients.',
        image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&h=400&fit=crop',
        initials: 'FZ',
        email: 'f.alzahra@taagc.com',
        social: { linkedin: '#', github: '#' },
        location: 'Cairo, Egypt',
        since: 2019,
        certifications: 'CISSP, CISM',
        tags: ['cybersecurity', 'cloud', 'security']
    },
    // RANK 12: Sergeant Major Contracts
    {
        id: 'rank-12',
        rank: 12,
        name: 'Kwame Asante',
        role: 'Sergeant Major • Senior Manager, Contracts',
        category: 'operations',
        tier: 3,
        tierName: 'Tier 3 • Bronze',
        bio: 'PMP certified. 15 years infrastructure project management. Delivered $450M in turnkey projects across Africa.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        initials: 'KA',
        email: 'k.asante@taagc.com',
        social: { linkedin: '#' },
        location: 'Accra, Ghana',
        since: 2015,
        projects: '$450M',
        tags: ['pmp', 'infrastructure', 'projects']
    },
    // RANK 13: Sergeant Merchandise
    {
        id: 'rank-13',
        rank: 13,
        name: 'Chloe Mensah',
        role: 'Sergeant • Manager, General Merchandise',
        category: 'operations',
        tier: 3,
        tierName: 'Tier 3 • Bronze',
        bio: 'Global sourcing specialist. Manages 10K+ SKUs across 35 countries. 50K+ shipments annually with 99% satisfaction.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        initials: 'CM',
        email: 'c.mensah@taagc.com',
        social: { linkedin: '#' },
        location: 'Lagos, Nigeria',
        since: 2020,
        skus: '10K+',
        tags: ['sourcing', 'merchandise', 'logistics']
    },
    // RANK 14: Corporal Logistics
    {
        id: 'rank-14',
        rank: 14,
        name: 'John Okonkwo',
        role: 'Corporal • Assistant Manager, Logistics',
        category: 'support',
        tier: 4,
        tierName: 'Tier 4 • Blue',
        bio: 'Supply chain optimization expert. Manages fleet of 200+ vehicles and 5 regional warehouses.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        initials: 'JO',
        email: 'j.okonkwo@taagc.com',
        location: 'Onitsha, Nigeria',
        since: 2021,
        fleet: '200+',
        tags: ['logistics', 'fleet', 'warehouse']
    },
    // RANK 15: Lance Corporal Supervisor
    {
        id: 'rank-15',
        rank: 15,
        name: 'Aisha Mohammed',
        role: 'Lance Corporal • Operations Supervisor',
        category: 'support',
        tier: 4,
        tierName: 'Tier 4 • Blue',
        bio: 'Six Sigma Green Belt. Leads team of 25 operations staff across procurement and customer service.',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
        initials: 'AM',
        email: 'a.mohammed@taagc.com',
        location: 'Kano, Nigeria',
        since: 2022,
        team: 25,
        tags: ['six sigma', 'operations', 'supervisor']
    },
    // RANK 16: Senior Specialist Finance
    {
        id: 'rank-16',
        rank: 16,
        name: 'David Ochieng',
        role: 'Senior Specialist, Finance',
        category: 'support',
        tier: 4,
        tierName: 'Tier 4 • Blue',
        bio: 'CPA, ACCA. Manages accounts payable, payroll, and financial reporting for group companies.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        initials: 'DO',
        email: 'd.ochieng@taagc.com',
        location: 'Nairobi, Kenya',
        since: 2020,
        certifications: 'CPA, ACCA',
        tags: ['finance', 'cpa', 'accounting']
    },
    // RANK 17: Specialist HR
    {
        id: 'rank-17',
        rank: 17,
        name: 'Ngozi Okonkwo',
        role: 'Specialist, Human Resources',
        category: 'support',
        tier: 4,
        tierName: 'Tier 4 • Blue',
        bio: 'CIPM certified. Leads recruitment, training, and employee relations for 127 staff across 15 countries.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        initials: 'NO',
        email: 'n.okonkwo@taagc.com',
        location: 'Lagos, Nigeria',
        since: 2021,
        staff: 127,
        tags: ['hr', 'recruitment', 'cipm']
    },
    // RANK 18: Junior Specialist IT
    {
        id: 'rank-18',
        rank: 18,
        name: 'Kwesi Appiah',
        role: 'Junior Specialist, IT Support',
        category: 'support',
        tier: 4,
        tierName: 'Tier 4 • Blue',
        bio: 'CompTIA A+, Network+. Provides technical support for 200+ users across global offices.',
        image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop',
        initials: 'KA',
        email: 'k.appiah@taagc.com',
        location: 'Accra, Ghana',
        since: 2023,
        certifications: 'CompTIA A+',
        tags: ['it', 'support', 'helpdesk']
    },
    // RANK 19: Senior Associate Procurement
    {
        id: 'rank-19',
        rank: 19,
        name: 'Fatima Bello',
        role: 'Senior Associate, Procurement',
        category: 'support',
        tier: 5,
        tierName: 'Tier 5 • Entry',
        bio: 'CIPS certified. Manages supplier relationships and purchase orders for general merchandise division.',
        image: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=400&h=400&fit=crop',
        initials: 'FB',
        email: 'f.bello@taagc.com',
        location: 'Kano, Nigeria',
        since: 2022,
        tags: ['procurement', 'cips', 'supplier']
    },
    // RANK 20: Associate Logistics
    {
        id: 'rank-20',
        rank: 20,
        name: 'Emmanuel Adebayo',
        role: 'Associate, Logistics',
        category: 'support',
        tier: 5,
        tierName: 'Tier 5 • Entry',
        bio: 'Supply chain coordinator. Manages shipment tracking, customs documentation, and last-mile delivery.',
        image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop',
        initials: 'EA',
        email: 'e.adebayo@taagc.com',
        location: 'Lagos, Nigeria',
        since: 2023,
        tags: ['logistics', 'shipping', 'customs']
    },
    // RANK 21: Junior Associate Marketing
    {
        id: 'rank-21',
        rank: 21,
        name: 'Amina Yusuf',
        role: 'Junior Associate, Marketing',
        category: 'support',
        tier: 5,
        tierName: 'Tier 5 • Entry',
        bio: 'Digital marketing specialist. Manages social media, content creation, and corporate communications.',
        image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&h=400&fit=crop',
        initials: 'AY',
        email: 'a.yusuf@taagc.com',
        location: 'Abuja, Nigeria',
        since: 2024,
        tags: ['marketing', 'social media', 'content']
    },
    // RANK 22: Entry Level
    {
        id: 'rank-22',
        rank: 22,
        name: 'Now Hiring',
        role: 'Entry Level • Graduate Trainee',
        category: 'support',
        tier: 5,
        tierName: 'Tier 5 • Entry',
        bio: 'Launch your career with TAAGC Global. Rotational program across five core sectors. Mentorship and rapid advancement.',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop',
        initials: 'NH',
        email: 'careers@taagc.com',
        hiring: true,
        hiringNote: '2 positions available',
        tags: ['hiring', 'entry-level', 'trainee'],
        featured: false
    }
];

// Get staff from Firestore (if using backend)
export async function fetchStaffFromFirestore() {
    try {
        const staffRef = collection(db, "staff");
        const q = query(staffRef, orderBy("rank", "asc"));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const firestoreStaff = [];
            snapshot.forEach(doc => {
                firestoreStaff.push({ id: doc.id, ...doc.data() });
            });
            return firestoreStaff;
        }
        return STAFF_DATA; // Fallback to static data
    } catch (error) {
        console.warn('Error fetching from Firestore, using static data:', error);
        return STAFF_DATA;
    }
}

// Stats calculator
export function getStaffStats(staff) {
    return {
        total: staff.length,
        executive: staff.filter(s => s.category === 'executive').length,
        operations: staff.filter(s => s.category === 'operations').length,
        support: staff.filter(s => s.category === 'support').length,
        hiring: staff.filter(s => s.hiring).length,
        featured: staff.filter(s => s.featured).length,
        tiers: {
            tier1: staff.filter(s => s.tier === 1).length,
            tier2: staff.filter(s => s.tier === 2).length,
            tier3: staff.filter(s => s.tier === 3).length,
            tier4: staff.filter(s => s.tier === 4).length,
            tier5: staff.filter(s => s.tier === 5).length
        }
    };
        }
