import { TeamMember, AlumniMember, EventItem, GalleryItem } from './types';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: "Alex Sterling",
    role: "President",
    image: "https://picsum.photos/400/400?random=1",
    socials: { linkedin: "#", github: "#", twitter: "#" }
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Vice President",
    image: "https://picsum.photos/400/400?random=2",
    socials: { linkedin: "#", github: "#" }
  },
  {
    id: 3,
    name: "Marcus Johnson",
    role: "Technical Lead",
    image: "https://picsum.photos/400/400?random=3",
    socials: { linkedin: "#", github: "#", twitter: "#" }
  },
  {
    id: 4,
    name: "Emily Davis",
    role: "Creative Director",
    image: "https://picsum.photos/400/400?random=4",
    socials: { linkedin: "#" }
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Event Manager",
    image: "https://picsum.photos/400/400?random=5",
    socials: { linkedin: "#", twitter: "#" }
  }
];

export const ALUMNI_MEMBERS: AlumniMember[] = [
  {
    id: 1,
    name: "David Kim",
    batch: "2023",
    company: "Google",
    role: "Software Engineer",
    image: "https://picsum.photos/400/400?random=6"
  },
  {
    id: 2,
    name: "Jessica Lee",
    batch: "2022",
    company: "Amazon",
    role: "Product Manager",
    image: "https://picsum.photos/400/400?random=7"
  },
  {
    id: 3,
    name: "Ryan Patel",
    batch: "2021",
    company: "SpaceX",
    role: "Systems Engineer",
    image: "https://picsum.photos/400/400?random=8"
  },
  {
    id: 4,
    name: "Anita Roy",
    batch: "2020",
    company: "Microsoft",
    role: "Data Scientist",
    image: "https://picsum.photos/400/400?random=9"
  }
];

export const EVENTS: EventItem[] = [
  {
    id: 1,
    title: "HackTheFuture 2024",
    date: "Oct 15, 2024",
    category: "Hackathon",
    description: "Our flagship 24-hour hackathon focused on AI and Sustainability solutions.",
    image: "https://picsum.photos/800/600?random=10"
  },
  {
    id: 2,
    title: "TechTalk: Quantum Computing",
    date: "Nov 02, 2024",
    category: "Workshop",
    description: "An introductory session to the world of Qubits with Dr. Feynman (Guest Speaker).",
    image: "https://picsum.photos/800/600?random=11"
  },
  {
    id: 3,
    title: "CodeSprint V",
    date: "Dec 10, 2024",
    category: "Competition",
    description: "Competitive programming contest hosted on CodeForces.",
    image: "https://picsum.photos/800/600?random=12"
  },
  {
    id: 4,
    title: "Design Matters",
    date: "Jan 20, 2025",
    category: "Workshop",
    description: "UI/UX workshop focusing on Figma and modern design principles.",
    image: "https://picsum.photos/800/600?random=13"
  }
];

export const GALLERY_IMAGES: GalleryItem[] = [
  { id: 1, src: "https://picsum.photos/600/400?random=20", alt: "Hackathon Crowd", category: "Events" },
  { id: 2, src: "https://picsum.photos/400/600?random=21", alt: "Winner Ceremony", category: "Awards" },
  { id: 3, src: "https://picsum.photos/600/600?random=22", alt: "Team Meeting", category: "Community" },
  { id: 4, src: "https://picsum.photos/500/700?random=23", alt: "Workshop Session", category: "Events" },
  { id: 5, src: "https://picsum.photos/700/500?random=24", alt: "Robotics Showcase", category: "Projects" },
  { id: 6, src: "https://picsum.photos/600/400?random=25", alt: "Guest Lecture", category: "Events" },
];
