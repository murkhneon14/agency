-- Clearly labeled, unpublished demonstration portfolio entries.
-- They do not represent client work and do not appear on public pages by default.
insert into public.portfolio_projects (title, slug, description, category, technologies, is_demo, is_published, sort_order)
values
  ('Demo · Commerce storefront', 'demo-commerce-storefront', 'A demonstration commerce experience with product browsing and a responsive checkout layout.', 'E-commerce Development', array['Next.js','TypeScript','PostgreSQL'], true, false, 10),
  ('Demo · Project workspace', 'demo-project-workspace', 'A demonstration SaaS workspace for organizing project tasks and progress.', 'SaaS Development', array['Next.js','React','Supabase'], true, false, 20)
on conflict (slug) do nothing;
