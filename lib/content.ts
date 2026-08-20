export interface ProjectContent {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  accent: "cyan" | "violet" | "silver" | "acid";
  metric: string;
  metricLabel: string;
}

export interface SkillContent {
  name: string;
  category: string;
  icon: string;
}

export interface SiteCopy {
  nav: {
    work: string;
    lab: string;
    stack: string;
    contact: string;
    availability: string;
  };
  hero: {
    eyebrow: string;
    lineOne: string;
    lineTwo: string;
    body: string;
    primary: string;
    secondary: string;
    scroll: string;
    objectLabel: string;
  };
  work: {
    kicker: string;
    title: string;
    body: string;
    cardAction: string;
  };
  projects: ProjectContent[];
  lab: {
    kicker: string;
    title: string;
    lead: string;
    body: string;
    principles: Array<{ number: string; title: string; body: string }>;
    metrics: Array<{ value: string; label: string }>;
  };
  stack: {
    kicker: string;
    title: string;
    body: string;
    hint: string;
  };
  skills: SkillContent[];
  contact: {
    kicker: string;
    title: string;
    body: string;
    action: string;
    email: string;
  };
}

const sharedSkills: SkillContent[] = [
  { name: "Next.js", category: "Frontend", icon: "layers" },
  { name: "TypeScript", category: "Systems", icon: "braces" },
  { name: "React", category: "Interface", icon: "atom" },
  { name: "Three.js", category: "Realtime 3D", icon: "box" },
  { name: "WebGL", category: "Graphics", icon: "orbit" },
  { name: "R3F", category: "Creative code", icon: "sparkles" },
  { name: "GLSL", category: "Shaders", icon: "waves" },
  { name: "Node.js", category: "Backend", icon: "server" },
  { name: "Motion", category: "Interaction", icon: "move" },
  { name: "Tailwind", category: "Design system", icon: "wind" },
  { name: "AI Systems", category: "Intelligence", icon: "brain" },
  { name: "Creative Direction", category: "Concept", icon: "aperture" },
];

export const content: SiteCopy = {
    nav: {
      work: "Work",
      lab: "Approach",
      stack: "Stack",
      contact: "Contact",
      availability: "Available for projects",
    },
    hero: {
      eyebrow: "Creative Technologist · Fullstack Developer",
      lineOne: "DIGITAL WORLDS",
      lineTwo: "IN MOTION",
      body:
        "I create expressive interfaces, real-time graphics and technology products where code, movement and light become one system.",
      primary: "View projects",
      secondary: "Discuss an idea",
      scroll: "Scroll to explore",
    objectLabel: "Iridescent motion loop",
    },
    work: {
      kicker: "01 / Selected work",
      title: "SYSTEMS THAT FEEL ALIVE",
      body:
        "Four concept projects spanning spatial commerce and generative identity. Each combines product clarity with a kinetic point of view.",
      cardAction: "Open case",
    },
    projects: [
      {
        id: "neon-atlas",
        index: "01",
        title: "NEON ATLAS",
        subtitle: "Spatial commerce platform",
        description:
          "An immersive catalog where products exist as interactive objects and the interface responds to the pace of exploration.",
        tags: ["Next.js", "WebGL", "AI Search"],
        accent: "cyan",
        metric: "+38%",
        metricLabel: "engagement",
      },
      {
        id: "aether-os",
        index: "02",
        title: "AETHER OS",
        subtitle: "Realtime observability workspace",
        description:
          "A living map of distributed systems turns dense signals into a legible spatial picture.",
        tags: ["R3F", "WebSockets", "Node.js"],
        accent: "violet",
        metric: "12ms",
        metricLabel: "data latency",
      },
      {
        id: "flux-archive",
        index: "03",
        title: "FLUX ARCHIVE",
        subtitle: "Kinetic cultural archive",
        description:
          "An editorial system whose typography changes density and rhythm alongside the viewer's path.",
        tags: ["Motion", "Headless CMS", "TypeScript"],
        accent: "silver",
        metric: "2.1×",
        metricLabel: "session depth",
      },
      {
        id: "pulse-01",
        index: "04",
        title: "PULSE / 01",
        subtitle: "Generative audio identity",
        description:
          "A visual organism synchronized with sound — from cover systems and live stages to a WebAudio instrument.",
        tags: ["GLSL", "WebAudio", "Creative Code"],
        accent: "acid",
        metric: "60fps",
        metricLabel: "live render",
      },
    ],
    lab: {
      kicker: "02 / How I work",
      title: "I DON'T DECORATE. I DESIGN BEHAVIOR.",
      lead:
        "Strong digital experiences happen when concept, code and performance are designed as one system.",
      body:
        "I move from feeling to prototype and from prototype to resilient architecture, keeping the idea's character intact through every technical layer.",
      principles: [
        {
          number: "A",
          title: "Feeling first",
          body: "Define movement, light and response before choosing the tool.",
        },
        {
          number: "B",
          title: "Prototype as proof",
          body: "Test difficult interactions in real time while decisions are still inexpensive to change.",
        },
        {
          number: "C",
          title: "Code as material",
          body: "Build a production system where beauty does not compete with speed or accessibility.",
        },
      ],
      metrics: [
        { value: "60", label: "target FPS" },
        { value: "12+", label: "disciplines, one process" },
        { value: "01", label: "coherent system" },
      ],
    },
    stack: {
      kicker: "03 / Toolkit",
      title: "A STACK FOR IDEAS THAT TEMPLATES CAN'T HOLD",
      body:
        "From shaders and motion systems to APIs and resilient frontend, I choose technology for the product's behavior — never for the trend.",
      hint: "Move closer or tap a skill",
    },
    skills: sharedSkills,
    contact: {
      kicker: "04 / Next experiment",
      title: "HAVE AN IDEA THAT NEEDS TO MOVE?",
      body:
        "Tell me what you want people to feel, do or change. We'll find its technological form together.",
      action: "Start a conversation",
      email: "hello@kineticlab.dev",
    },
};
