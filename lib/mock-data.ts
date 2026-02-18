export interface Portfolio {
  id: string
  name: string
  username: string
  description: string
  profileImage: string
  bannerImage: string
  primaryColor: string
  seoTitle: string
  seoDescription: string
  socials: {
    twitter?: string
    github?: string
    linkedin?: string
    website?: string
  }
  projectCount: number
  createdAt: string
}

export interface Project {
  id: string
  portfolioId: string
  title: string
  slug: string
  description: string
  technologies: string[]
  demoUrl: string
  githubUrl: string
  date: string
  featured: boolean
  images: string[]
  coverImage: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: "free" | "pro"
}

export const mockUser: User = {
  id: "1",
  name: "Alex Rivera",
  email: "alex@example.com",
  avatar: "",
  plan: "pro",
}

export const mockPortfolios: Portfolio[] = [
  {
    id: "1",
    name: "Alex Rivera - Developer",
    username: "alexrivera",
    description:
      "Full-stack developer passionate about building elegant solutions to complex problems. Specializing in React, Next.js, and TypeScript.",
    profileImage: "",
    bannerImage: "",
    primaryColor: "#000000",
    seoTitle: "Alex Rivera | Full-Stack Developer Portfolio",
    seoDescription:
      "Explore the work and projects of Alex Rivera, a full-stack developer specializing in React and Next.js.",
    socials: {
      twitter: "https://twitter.com/alexrivera",
      github: "https://github.com/alexrivera",
      linkedin: "https://linkedin.com/in/alexrivera",
      website: "https://alexrivera.dev",
    },
    projectCount: 4,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Design Works",
    username: "designworks",
    description:
      "A curated collection of UI/UX design projects showcasing modern, minimal interfaces.",
    profileImage: "",
    bannerImage: "",
    primaryColor: "#171717",
    seoTitle: "Design Works | UI/UX Portfolio",
    seoDescription:
      "Showcasing modern UI/UX design projects with a focus on minimalism and usability.",
    socials: {
      twitter: "https://twitter.com/designworks",
      github: "https://github.com/designworks",
    },
    projectCount: 2,
    createdAt: "2024-03-22",
  },
]

export const mockProjects: Project[] = [
  {
    id: "1",
    portfolioId: "1",
    title: "Vaultify",
    slug: "vaultify",
    description:
      "A secure password manager built with end-to-end encryption. Features include password generation, secure sharing, and cross-device sync. Built with a focus on privacy-first design and zero-knowledge architecture.\n\nThe application uses AES-256 encryption on the client side, ensuring that passwords are never transmitted in plain text. The sync engine handles conflict resolution gracefully across multiple devices.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma"],
    demoUrl: "https://vaultify.demo.com",
    githubUrl: "https://github.com/alexrivera/vaultify",
    date: "2024-06-15",
    featured: true,
    images: [],
    coverImage: "",
  },
  {
    id: "2",
    portfolioId: "1",
    title: "Taskflow",
    slug: "taskflow",
    description:
      "A project management tool with real-time collaboration features. Includes kanban boards, team chat, and automated workflows. Designed for small teams who need a lightweight alternative to complex project management suites.\n\nFeatures drag-and-drop task management, real-time updates via WebSockets, and customizable workflow automations.",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Redis"],
    demoUrl: "https://taskflow.demo.com",
    githubUrl: "https://github.com/alexrivera/taskflow",
    date: "2024-04-10",
    featured: true,
    images: [],
    coverImage: "",
  },
  {
    id: "3",
    portfolioId: "1",
    title: "Weatherly",
    slug: "weatherly",
    description:
      "A beautiful weather application with detailed forecasts and interactive maps. Uses multiple weather APIs to provide accurate, hyper-local weather data with a clean, intuitive interface.",
    technologies: ["React Native", "TypeScript", "MapboxGL"],
    demoUrl: "https://weatherly.demo.com",
    githubUrl: "https://github.com/alexrivera/weatherly",
    date: "2024-02-20",
    featured: false,
    images: [],
    coverImage: "",
  },
  {
    id: "4",
    portfolioId: "1",
    title: "Devblog Engine",
    slug: "devblog-engine",
    description:
      "A markdown-based blogging platform built for developers. Features syntax highlighting, MDX support, and automatic OG image generation. Optimized for performance with static generation.",
    technologies: ["Next.js", "MDX", "Vercel OG", "Tailwind CSS"],
    demoUrl: "https://devblog.demo.com",
    githubUrl: "https://github.com/alexrivera/devblog",
    date: "2024-01-05",
    featured: false,
    images: [],
    coverImage: "",
  },
  {
    id: "5",
    portfolioId: "2",
    title: "Minimal Dashboard",
    slug: "minimal-dashboard",
    description:
      "A clean, modern analytics dashboard design with data visualization components. Built with accessibility in mind and responsive across all devices.",
    technologies: ["Figma", "React", "D3.js", "Tailwind CSS"],
    demoUrl: "https://dashboard.demo.com",
    githubUrl: "https://github.com/designworks/dashboard",
    date: "2024-05-01",
    featured: true,
    images: [],
    coverImage: "",
  },
  {
    id: "6",
    portfolioId: "2",
    title: "E-Commerce Redesign",
    slug: "ecommerce-redesign",
    description:
      "Complete redesign of an e-commerce platform focusing on conversion optimization and user experience. Increased checkout completion by 40%.",
    technologies: ["Figma", "Framer", "CSS", "React"],
    demoUrl: "https://ecommerce.demo.com",
    githubUrl: "https://github.com/designworks/ecommerce",
    date: "2024-03-15",
    featured: true,
    images: [],
    coverImage: "",
  },
]

export function getPortfolioByUsername(username: string): Portfolio | undefined {
  return mockPortfolios.find((p) => p.username === username)
}

export function getProjectsByPortfolioId(portfolioId: string): Project[] {
  return mockProjects.filter((p) => p.portfolioId === portfolioId)
}

export function getProjectBySlug(portfolioId: string, slug: string): Project | undefined {
  return mockProjects.find((p) => p.portfolioId === portfolioId && p.slug === slug)
}

export function getPortfolioById(id: string): Portfolio | undefined {
  return mockPortfolios.find((p) => p.id === id)
}
