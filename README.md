# KINETIC//LAB

Высокопроизводительное portfolio на Next.js App Router в эстетике Kinetic Particle Lab / Liquid Chrome. Проект полностью локальный: контент, 3D-сцена и окружение не зависят от внешнего CMS или ассетов.

## Запуск

Нужны Node.js 20+ и pnpm 11.

```bash
pnpm install
pnpm dev
```

Откройте `http://localhost:3000`.

Production-проверка:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

## Где менять контент

- Двуязычные тексты, проекты, навыки и email: `lib/content.ts`
- Глобальная визуальная система и responsive-правила: `app/globals.css`
- WebGL-сцена и liquid chrome: `components/HeroCanvas.tsx`
- Основная композиция секций: `components/Portfolio.tsx`

## Архитектура взаимодействий

- `SmoothScroll.tsx` — Lenis для wheel и touch с graceful fallback при reduced motion.
- `CustomCursor.tsx` — desktop-аура, touch glow и ripple.
- `HeroCanvas.tsx` — R3F-сцена с pointer/touch follow и автономным «дыханием».
- `MagneticButton.tsx` — магнитное движение на ПК и edge pulse на touch.
- `ProjectCard.tsx` — perspective tilt, mobile focus, vibration и border sweep.
- `SkillsCloud.tsx` — pointer proximity и мобильное floating motion.

Canvas работает с адаптивным DPR `[1, 2]`. У `IcosahedronGeometry` используется detail `5`: в Three.js это рекурсивная глубина (`20 × 4^detail` граней), поэтому значение `48` создало бы непригодную для браузера геометрию вместо оптимизации.
