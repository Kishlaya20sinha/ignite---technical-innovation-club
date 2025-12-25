import { TeamMember, AlumniMember, EventItem, GalleryItem } from './types';

/* ===================== TEAM ===================== */

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "Kishlaya Sinha", role: "President", image: "/team/kishlaya.jpg", socials: { linkedin: "https://www.linkedin.com/in/kishlaya-sinha-9134a0211" } },

  { id: 2, name: "Aditya Agarwal", role: "Vice President", image: "/team/aditya.jpeg", socials: { linkedin: "https://www.linkedin.com/in/aditya2227" } },
  { id: 3, name: "Saumya Kumari", role: "Vice President", image: "/team/saumya.jpg", socials: { linkedin: "#" } },

  { id: 4, name: "Vishal Kumar Singh", role: "Secretary", image: "/team/vishalkr.jpg", socials: { linkedin: "#" } },
  { id: 5, name: "Shivam Lal", role: "Treasurer", image: "/team/shivam.png", socials: { linkedin: "#" } },


  { id: 6, name: "Prem Kumar Singh", role: "Event Head", image: "/team/premkumar.jpg", socials: { linkedin: "#" } },
  { id: 7, name: "Priyanka Agrawal", role: "Event Lead", image: "/team/priyanka.jpg", socials: { linkedin: "#" } },
  { id: 8, name: "Abhishek Anand", role: "Event Lead", image: "/team/abhishek.jpeg", socials: { linkedin: "#" } },

  { id: 9, name: "Kalpana", role: "Design Head", image: "/team/kalpana.jpg", socials: { linkedin: "#" } },
  { id: 10, name: "Shalini Shalu", role: "Design Lead", image: "/team/shalini.jpg", socials: { linkedin: "#" } },
  { id: 11, name: "Niharika Soni", role: "Design Lead", image: "/team/niharika.jpg", socials: { linkedin: "#" } },

  { id: 12, name: "Gargi Priya", role: "Webmaster", image: "/team/gargi.jpg", socials: { linkedin: "#" } },

  { id: 13, name: "Pratik Raj", role: "Resource Head", image: "/team/pratik.webp", socials: { linkedin: "#" } },
  { id: 14, name: "Rohit Gupta", role: "Resource Lead", image: "/team/rohitgupta.jpg", socials: { linkedin: "#" } },
  { id: 15, name: "Prince Chaturvedi", role: "Resource Lead", image: "/team/prince.jpeg", socials: { linkedin: "#" } },

  { id: 16, name: "Bhavini Awasthi", role: "Finance Head", image: "/team/bhavini.jpg", socials: { linkedin: "#" } },
  { id: 17, name: "Tushan Jyoti", role: "Finance Lead", image: "/team/tushan.jpg", socials: { linkedin: "#" } },

  { id: 18, name: "Shayan Ahmad Khan", role: "PR Head", image: "/team/shayan.jpg", socials: { linkedin: "#" } },
  { id: 19, name: "Arfa Khanam", role: "PR Lead", image: "/team/arfa.jpg", socials: { linkedin: "#" } },

  /* ===================== MEMBERS ===================== */

  { id: 26, name: "Anjali Kumari", role: "Member", image: "/team/anjalicsejunior.jpg", socials: { linkedin: "#" } },
  { id: 21, name: "Ram Kishan Mehta", role: "Member", image: "/team/ram.jpg", socials: { linkedin: "#" } },
  { id: 43, name: "Ashutosh Kumar", role: "Member", image: "/team/ashutosh.jpg", socials: { linkedin: "#" } },
  { id: 27, name: "Raj Yash Gupta", role: "Member", image: "/team/rajyash.JPG", socials: { linkedin: "#" } },

  { id: 33, name: "Rajeev Raj", role: "Member", image: "/team/rajeev.jpg", socials: { linkedin: "#" } },
  { id: 38, name: "Kanan Kotwani", role: "Member", image: "/team/kanan.jpg", socials: { linkedin: "#" } },
  { id: 40, name: "Sahil Suman", role: "Member", image: "/team/sahil.jpg", socials: { linkedin: "#" } },
  { id: 36, name: "Khushboo", role: "Member", image: "/team/khushboo.jpg", socials: { linkedin: "#" } },

  { id: 20, name: "Aditya Kumar", role: "Member", image: "/team/adityajunior.jpg", socials: { linkedin: "#" } },
  { id: 25, name: "Ritu Raj", role: "Member", image: "/team/rituraj.jpg", socials: { linkedin: "#" } },
  { id: 24, name: "Daya Shankar", role: "Member", image: "/team/dayashankar.png", socials: { linkedin: "#" } },
  { id: 29, name: "Aayush Babu", role: "Member", image: "/team/aayushbabu.jpg", socials: { linkedin: "#" } },

  { id: 34, name: "Anushka Nandan", role: "Member", image: "/team/anushka.jpg", socials: { linkedin: "#" } },
  { id: 32, name: "Aditi Maharor", role: "Member", image: "/team/aditimaharor.jpg", socials: { linkedin: "#" } },
  { id: 37, name: "Shreyanka Basak", role: "Member", image: "/team/shreyanka.jpg", socials: { linkedin: "#" } },
  { id: 42, name: "Soumya Sharma", role: "Member", image: "/team/soumya.jpeg", socials: { linkedin: "#" } },

  { id: 39, name: "Prisha Raj", role: "Member", image: "/team/prisha.jpeg", socials: { linkedin: "#" } },
  { id: 41, name: "Krish", role: "Member", image: "/team/krish.jpg", socials: { linkedin: "#" } },
  { id: 22, name: "Vijay Kumar Das", role: "Member", image: "/team/vijay.jpg", socials: { linkedin: "#" } },
  { id: 23, name: "Shivam Singh", role: "Member", image: "/team/shivamsingh.jpg", socials: { linkedin: "#" } },

  { id: 28, name: "Kshitij Tiwari", role: "Member", image: "/team/kshitij.jpg", socials: { linkedin: "#" } },
  { id: 31, name: "Aayush Arya", role: "Member", image: "/team/ayusharya.png", socials: { linkedin: "#" } },
  { id: 35, name: "Abhishek Bharti", role: "Member", image: "/team/abhishekbharti.jpg", socials: { linkedin: "#" } },
];

/* ===================== ALUMNI (2022) ===================== */

export const ALUMNI_MEMBERS: AlumniMember[] = [
  { id: 1, name: "Priyanshu Shankar", batch: "2022", image: "/alumni/priyanshu.jpg", linkedin: "#" },
  { id: 2, name: "Sakshi Sharan", batch: "2022", image: "/alumni/sakshisharan.jpg", linkedin: "#" },
  { id: 3, name: "Shashwat Srivastava", batch: "2022", image: "/placeholder.svg", linkedin: "#" },
  { id: 4, name: "Yuvika", batch: "2022", image: "/placeholder.svg", linkedin: "#" },
  { id: 5, name: "Anshika Pandey", batch: "2022", image: "/alumni/anshika.jpg", linkedin: "#" },
  { id: 6, name: "Prem Kamal", batch: "2022", image: "/alumni/premkamal.jpg", linkedin: "#" },
  { id: 7, name: "Parth Kumar", batch: "2022", image: "/alumni/parth.jpg", linkedin: "#" },
  { id: 8, name: "Shubham Ghosh", batch: "2022", image: "/placeholder.svg", linkedin: "#" },
  { id: 9, name: "Pragati", batch: "2022", image: "/alumni/pragati.svg", linkedin: "#" },
  { id: 10, name: "Aditya Kumar", batch: "2022", image: "/alumni/aditya.svg", linkedin: "#" },
  { id: 11, name: "Rishav", batch: "2022", image: "/alumni/rishav.jpg", linkedin: "#" },
  { id: 12, name: "Shweta", batch: "2022", image: "/alumni/shwetachoudhari.jpg", linkedin: "#" },
  { id: 13, name: "Tripti Kumari", batch: "2022", image: "/alumni/tripti.jpg", linkedin: "#" },
];

/* ===================== EVENTS ===================== */

export const EVENTS: EventItem[] = [
  {
    id: 1,
    title: "INgeniEUX 2.0",
    date: "Coming Soon",
    category: "Tech Event",
    description: "Our flagship tech innovation event.",
    image: "/events/placeholder.svg",
  },
  {
    id: 2,
    title: "Xordium 4.0",
    date: "Nov 5 	6 Nov 9, 2025",
    category: "Annual Tech + Fun Event",
    description: "The biggest annual fest by Ignite Club.",
    image: "/events/placeholder.svg",
  },
  {
    id: 3,
    title: "Humanoid & Beyond Workshop",
    date: "Oct 8, 2025",
    category: "Workshop",
    description: "Introductory session on Robotics, IoT & AI.",
    image: "/events/placeholder.svg",
  },
];

/* ===================== GALLERY ===================== */

export const GALLERY_IMAGES: GalleryItem[] = [
  { id: 1, src: "/gallery/placeholder.svg", alt: "Xordium Crowd", category: "Events" },
  { id: 2, src: "/gallery/placeholder.svg", alt: "Prize Distribution", category: "Awards" },
  { id: 3, src: "/gallery/placeholder.svg", alt: "Team Meet", category: "Community" },
  { id: 4, src: "/gallery/placeholder.svg", alt: "Workshop Session", category: "Events" },
  { id: 5, src: "/gallery/placeholder.svg", alt: "Robotics Demo", category: "Projects" },
  { id: 6, src: "/gallery/placeholder.svg", alt: "Guest Lecture", category: "Events" },
];
