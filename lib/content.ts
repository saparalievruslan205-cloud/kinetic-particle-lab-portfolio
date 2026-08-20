export type Locale = "ru" | "en";

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
    languageLabel: string;
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
  footer: {
    note: string;
    localTime: string;
    copyright: string;
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

export const content: Record<Locale, SiteCopy> = {
  ru: {
    nav: {
      work: "Работы",
      lab: "Подход",
      stack: "Стек",
      contact: "Контакт",
      availability: "Доступен для проектов",
      languageLabel: "Выбор языка",
    },
    hero: {
      eyebrow: "Creative Technologist · Fullstack Developer",
      lineOne: "ЦИФРОВЫЕ МИРЫ",
      lineTwo: "В ДВИЖЕНИИ",
      body:
        "Создаю выразительные интерфейсы, real-time графику и технологичные продукты на пересечении кода, движения и света.",
      primary: "Смотреть проекты",
      secondary: "Обсудить идею",
      scroll: "Листайте, чтобы исследовать",
      objectLabel: "Интерактивный liquid chrome объект",
    },
    work: {
      kicker: "01 / Избранные работы",
      title: "СИСТЕМЫ, КОТОРЫЕ ЧУВСТВУЮТСЯ ЖИВЫМИ",
      body:
        "Четыре демонстрационных кейса — от пространственного commerce до генеративной айдентики. Каждый соединяет продуктовую ясность и кинетический характер.",
      cardAction: "Открыть кейс",
    },
    projects: [
      {
        id: "neon-atlas",
        index: "01",
        title: "NEON ATLAS",
        subtitle: "Пространственная commerce-платформа",
        description:
          "Иммерсивный каталог, где продукты существуют как интерактивные объекты, а интерфейс реагирует на темп исследования.",
        tags: ["Next.js", "WebGL", "AI Search"],
        accent: "cyan",
        metric: "+38%",
        metricLabel: "вовлечение",
      },
      {
        id: "aether-os",
        index: "02",
        title: "AETHER OS",
        subtitle: "Realtime observability workspace",
        description:
          "Живая карта распределённых систем превращает сложные сигналы в понятную пространственную картину.",
        tags: ["R3F", "WebSockets", "Node.js"],
        accent: "violet",
        metric: "12ms",
        metricLabel: "data latency",
      },
      {
        id: "flux-archive",
        index: "03",
        title: "FLUX ARCHIVE",
        subtitle: "Кинетический культурный архив",
        description:
          "Редакционная система с типографикой, которая меняет плотность и ритм вместе с историей пользователя.",
        tags: ["Motion", "Headless CMS", "TypeScript"],
        accent: "silver",
        metric: "2.1×",
        metricLabel: "глубина сессии",
      },
      {
        id: "pulse-01",
        index: "04",
        title: "PULSE / 01",
        subtitle: "Генеративная аудио-айдентика",
        description:
          "Визуальный организм, синхронизированный с музыкой: от обложек и лайв-сцены до WebAudio-инструмента.",
        tags: ["GLSL", "WebAudio", "Creative Code"],
        accent: "acid",
        metric: "60fps",
        metricLabel: "live render",
      },
    ],
    lab: {
      kicker: "02 / Как я работаю",
      title: "НЕ ДЕКОРИРУЮ. СОБИРАЮ ПОВЕДЕНИЕ.",
      lead:
        "Сильный digital-опыт появляется, когда концепция, код и производительность проектируются как одна система.",
      body:
        "Я двигаюсь от ощущения к прототипу, от прототипа к устойчивой архитектуре — сохраняя характер идеи на каждом техническом слое.",
      principles: [
        {
          number: "A",
          title: "Сначала ощущение",
          body: "Формулирую движение, свет и реакцию интерфейса до того, как выбираю инструмент.",
        },
        {
          number: "B",
          title: "Прототип как доказательство",
          body: "Проверяю сложные взаимодействия в real-time, пока решения ещё легко менять.",
        },
        {
          number: "C",
          title: "Код как материал",
          body: "Собираю production-систему, где красота не конфликтует со скоростью и доступностью.",
        },
      ],
      metrics: [
        { value: "60", label: "целевых FPS" },
        { value: "12+", label: "дисциплин в одном процессе" },
        { value: "01", label: "цельная система" },
      ],
    },
    stack: {
      kicker: "03 / Инструменты",
      title: "СТЕК ДЛЯ ИДЕЙ, КОТОРЫЕ НЕЛЬЗЯ СОБРАТЬ ШАБЛОНОМ",
      body:
        "От шейдеров и motion-систем до API и устойчивого frontend — выбираю технологию по поведению продукта, а не по моде.",
      hint: "Наведите курсор или коснитесь навыка",
    },
    skills: sharedSkills,
    contact: {
      kicker: "04 / Следующий эксперимент",
      title: "ЕСТЬ ИДЕЯ, КОТОРАЯ ДОЛЖНА ДВИГАТЬСЯ?",
      body:
        "Расскажите, что вы хотите заставить чувствовать, делать или менять. Найдём технологическую форму вместе.",
      action: "Начать разговор",
      email: "hello@kineticlab.dev",
    },
    footer: {
      note: "Спроектировано и собрано как живая система.",
      localTime: "BISHKEK / UTC+6",
      copyright: "KINETIC//LAB © 2026",
    },
  },
  en: {
    nav: {
      work: "Work",
      lab: "Approach",
      stack: "Stack",
      contact: "Contact",
      availability: "Available for projects",
      languageLabel: "Select language",
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
      objectLabel: "Interactive liquid chrome object",
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
    footer: {
      note: "Designed and engineered as a living system.",
      localTime: "BISHKEK / UTC+6",
      copyright: "KINETIC//LAB © 2026",
    },
  },
};
