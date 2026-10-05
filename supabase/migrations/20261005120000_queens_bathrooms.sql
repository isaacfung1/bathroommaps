-- Bathroom Maps tables for Queen's University at Kingston.
-- Safe to re-run. Does not alter any other tables in this database.
-- Washroom coordinates are offsets from building centroids, not surveyed stalls.

create table if not exists public.bathrooms (
    id uuid primary key,
    campus text not null default 'queens',
    name text not null,
    gender text not null check (gender in ('women', 'men', 'all_gender')),
    is_accessible boolean not null default false,
    building text not null,
    floor integer not null,
    latitude double precision not null,
    longitude double precision not null,
    num_stalls integer not null default 0 check (num_stalls >= 0),
    num_urinals integer not null default 0 check (num_urinals >= 0),
    num_sinks integer not null default 0 check (num_sinks >= 0),
    is_approximate boolean not null default true,
    created_at timestamptz not null default now(),
    unique (campus, building, floor, gender)
);

create table if not exists public.bathroom_reports (
    id uuid primary key default gen_random_uuid(),
    bathroom_id uuid not null references public.bathrooms (id) on delete cascade,
    cleanliness_rating double precision not null check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
    created_at timestamptz not null default now()
);

create index if not exists bathrooms_campus_idx on public.bathrooms (campus);
create index if not exists bathroom_reports_bathroom_created_idx
    on public.bathroom_reports (bathroom_id, created_at desc);

alter table public.bathrooms enable row level security;
alter table public.bathroom_reports enable row level security;

drop policy if exists bathroom_maps_read_bathrooms on public.bathrooms;
create policy bathroom_maps_read_bathrooms
    on public.bathrooms
    for select
    to anon, authenticated
    using (true);

drop policy if exists bathroom_maps_read_reports on public.bathroom_reports;
create policy bathroom_maps_read_reports
    on public.bathroom_reports
    for select
    to anon, authenticated
    using (true);

grant select on public.bathrooms to anon, authenticated;
grant select on public.bathroom_reports to anon, authenticated;

delete from public.bathroom_reports
where bathroom_id in (select id from public.bathrooms where campus = 'queens');

delete from public.bathrooms where campus = 'queens';

insert into public.bathrooms (
    id, campus, name, gender, is_accessible, building, floor,
    latitude, longitude, num_stalls, num_urinals, num_sinks, is_approximate
) values
('d458c353-4d52-5ddc-98a1-9267287fd949'::uuid, 'queens', 'Stauffer Library 1F All-gender', 'all_gender', true, 'Stauffer Library', 1, 44.2286378, -76.4962000, 3, 0, 2, true),
('39ab7850-5efa-5965-ab92-a9e4818ced03'::uuid, 'queens', 'Stauffer Library 1F Women''s', 'women', false, 'Stauffer Library', 1, 44.2284581, -76.4960245, 6, 0, 4, true),
('798cb61a-9ba3-549e-a23c-5918923367ab'::uuid, 'queens', 'Stauffer Library 1F Men''s', 'men', false, 'Stauffer Library', 1, 44.2284581, -76.4963755, 2, 3, 2, true),
('d8dc5802-ffa0-5a8b-94ea-bc388152fbe5'::uuid, 'queens', 'Stauffer Library 2F All-gender', 'all_gender', true, 'Stauffer Library', 2, 44.2287995, -76.4962000, 2, 0, 2, true),
('464f4775-5004-54a9-833d-5c74931a30bb'::uuid, 'queens', 'Stauffer Library 3F All-gender', 'all_gender', true, 'Stauffer Library', 3, 44.2289612, -76.4962000, 2, 0, 2, true),
('9b0e4624-ccad-56b4-9ccb-d89e1517dad0'::uuid, 'queens', 'Douglas Library 1F All-gender', 'all_gender', true, 'Douglas Library', 1, 44.2274578, -76.4950200, 3, 0, 2, true),
('dc1d8e75-03c6-5844-85e3-0993bfd59c2b'::uuid, 'queens', 'Douglas Library 1F Women''s', 'women', false, 'Douglas Library', 1, 44.2272781, -76.4948445, 6, 0, 4, true),
('8005bf29-8261-5f78-afea-9f2cacbe3fe6'::uuid, 'queens', 'Douglas Library 1F Men''s', 'men', false, 'Douglas Library', 1, 44.2272781, -76.4951955, 2, 3, 2, true),
('95c6fb2c-8dc8-5b06-ba2d-c7bd28bc9b72'::uuid, 'queens', 'Douglas Library 2F All-gender', 'all_gender', true, 'Douglas Library', 2, 44.2276195, -76.4950200, 2, 0, 2, true),
('8d6ed293-0421-55d9-a526-6ed7e840af3d'::uuid, 'queens', 'Mackintosh-Corry Hall 1F All-gender', 'all_gender', true, 'Mackintosh-Corry Hall', 1, 44.2266910, -76.4969721, 3, 0, 2, true),
('13604b2b-65aa-52f4-ab4f-e1115cf71623'::uuid, 'queens', 'Mackintosh-Corry Hall 1F Women''s', 'women', false, 'Mackintosh-Corry Hall', 1, 44.2265113, -76.4967966, 6, 0, 4, true),
('ffcc1ed6-b5c9-5ea8-bd35-fa35028e5d08'::uuid, 'queens', 'Mackintosh-Corry Hall 1F Men''s', 'men', false, 'Mackintosh-Corry Hall', 1, 44.2265113, -76.4971476, 2, 3, 2, true),
('54ffb3ac-0b7a-5cbd-b4b1-002ae88274bd'::uuid, 'queens', 'Mackintosh-Corry Hall 2F All-gender', 'all_gender', true, 'Mackintosh-Corry Hall', 2, 44.2268527, -76.4969721, 2, 0, 2, true),
('3feb95d4-5c42-5d1b-addb-ea9b11201231'::uuid, 'queens', 'John Deutsch University Centre 1F All-gender', 'all_gender', true, 'John Deutsch University Centre', 1, 44.2285434, -76.4948911, 3, 0, 2, true),
('8f9c71f2-aa7f-5755-ad2e-df38ea990807'::uuid, 'queens', 'John Deutsch University Centre 1F Women''s', 'women', false, 'John Deutsch University Centre', 1, 44.2283637, -76.4947156, 6, 0, 4, true),
('49d043d9-16ae-5eec-aabd-5c5987af1063'::uuid, 'queens', 'John Deutsch University Centre 1F Men''s', 'men', false, 'John Deutsch University Centre', 1, 44.2283637, -76.4950666, 2, 3, 2, true),
('c60c2842-6d25-51f9-863b-270495da5b7a'::uuid, 'queens', 'John Deutsch University Centre 2F All-gender', 'all_gender', true, 'John Deutsch University Centre', 2, 44.2287051, -76.4948911, 2, 0, 2, true),
('61deede4-10dc-58e7-8312-ccafa5a558db'::uuid, 'queens', 'Queen''s Centre 1F All-gender', 'all_gender', true, 'Queen''s Centre', 1, 44.2292178, -76.4948000, 3, 0, 2, true),
('c91c3365-3dbd-5bcc-bc36-7ec3bd1ef1d9'::uuid, 'queens', 'Queen''s Centre 1F Women''s', 'women', false, 'Queen''s Centre', 1, 44.2290381, -76.4946245, 6, 0, 4, true),
('8a8366b3-793a-52a5-aa54-2c84728d59eb'::uuid, 'queens', 'Queen''s Centre 1F Men''s', 'men', false, 'Queen''s Centre', 1, 44.2290381, -76.4949755, 2, 3, 2, true),
('4bd2c385-3d3b-51b7-86dc-01f7747d8a0b'::uuid, 'queens', 'Queen''s Centre 2F All-gender', 'all_gender', true, 'Queen''s Centre', 2, 44.2293795, -76.4948000, 2, 0, 2, true),
('700a4200-8ce1-54b4-b467-ff1466085068'::uuid, 'queens', 'Jeffery Hall 1F All-gender', 'all_gender', true, 'Jeffery Hall', 1, 44.2260178, -76.4961000, 3, 0, 2, true),
('f11af25f-88db-5d10-9f2a-a6b1139a1fe8'::uuid, 'queens', 'Jeffery Hall 1F Women''s', 'women', false, 'Jeffery Hall', 1, 44.2258381, -76.4959245, 6, 0, 4, true),
('11c24d4d-3553-5b5f-be66-ec92c6f8c23b'::uuid, 'queens', 'Jeffery Hall 1F Men''s', 'men', false, 'Jeffery Hall', 1, 44.2258381, -76.4962755, 2, 3, 2, true),
('76677d1d-79f5-516e-8b68-56d617cbc108'::uuid, 'queens', 'Ellis Hall 1F All-gender', 'all_gender', true, 'Ellis Hall', 1, 44.2264478, -76.4961900, 3, 0, 2, true),
('ffa566e9-08ef-5fe7-bf8d-001bf7e5d1f2'::uuid, 'queens', 'Ellis Hall 1F Women''s', 'women', false, 'Ellis Hall', 1, 44.2262681, -76.4960145, 6, 0, 4, true),
('223db1e2-dfc4-5da8-ac85-6aa6136e74b7'::uuid, 'queens', 'Ellis Hall 1F Men''s', 'men', false, 'Ellis Hall', 1, 44.2262681, -76.4963655, 2, 3, 2, true),
('d7064840-9029-5588-a367-33d582c6d7e5'::uuid, 'queens', 'Stirling Hall 1F All-gender', 'all_gender', true, 'Stirling Hall', 1, 44.2246878, -76.4977100, 3, 0, 2, true),
('8c3d463f-fe71-5bfd-bf4b-3c646f9572eb'::uuid, 'queens', 'Stirling Hall 1F Women''s', 'women', false, 'Stirling Hall', 1, 44.2245081, -76.4975345, 6, 0, 4, true),
('70df8902-e9c0-5be1-8eb6-c8a94e6cb5c6'::uuid, 'queens', 'Stirling Hall 1F Men''s', 'men', false, 'Stirling Hall', 1, 44.2245081, -76.4978855, 2, 3, 2, true),
('4cd985af-5265-5fdb-871f-691cbcb147e5'::uuid, 'queens', 'Watson Hall 1F All-gender', 'all_gender', true, 'Watson Hall', 1, 44.2256678, -76.4974200, 3, 0, 2, true),
('2731ad84-a269-54d4-8391-87bf8307f032'::uuid, 'queens', 'Watson Hall 1F Women''s', 'women', false, 'Watson Hall', 1, 44.2254881, -76.4972445, 6, 0, 4, true),
('481b55eb-f953-5d89-9caa-83633c277e20'::uuid, 'queens', 'Watson Hall 1F Men''s', 'men', false, 'Watson Hall', 1, 44.2254881, -76.4975955, 2, 3, 2, true),
('28643464-abc9-5ba7-931c-c8998fe4ae91'::uuid, 'queens', 'Kingston Hall 1F All-gender', 'all_gender', true, 'Kingston Hall', 1, 44.2257978, -76.4948800, 3, 0, 2, true),
('6ab3468e-ea59-54ad-a236-6c3f9330f8fb'::uuid, 'queens', 'Kingston Hall 1F Women''s', 'women', false, 'Kingston Hall', 1, 44.2256181, -76.4947045, 6, 0, 4, true),
('4a3d3f08-6deb-590d-a8b6-141ad961d172'::uuid, 'queens', 'Kingston Hall 1F Men''s', 'men', false, 'Kingston Hall', 1, 44.2256181, -76.4950555, 2, 3, 2, true),
('7c7610f2-d800-526c-b61d-f25bf59f0dfe'::uuid, 'queens', 'Ontario Hall 1F All-gender', 'all_gender', true, 'Ontario Hall', 1, 44.2266778, -76.4950400, 3, 0, 2, true),
('28f546b9-5309-5be9-9df5-451c695764e0'::uuid, 'queens', 'Ontario Hall 1F Women''s', 'women', false, 'Ontario Hall', 1, 44.2264981, -76.4948645, 6, 0, 4, true),
('2e111226-543d-5b9b-b204-368ddd556816'::uuid, 'queens', 'Ontario Hall 1F Men''s', 'men', false, 'Ontario Hall', 1, 44.2264981, -76.4952155, 2, 3, 2, true),
('9622de21-4e5f-5399-be48-2f3b15db6274'::uuid, 'queens', 'Theological Hall 1F All-gender', 'all_gender', true, 'Theological Hall', 1, 44.2258178, -76.4935300, 3, 0, 2, true),
('c71685ff-3717-507d-809f-9f3293e18828'::uuid, 'queens', 'Theological Hall 1F Women''s', 'women', false, 'Theological Hall', 1, 44.2256381, -76.4933545, 6, 0, 4, true),
('1e1dda12-552c-50ce-a2ee-94938bc2e88d'::uuid, 'queens', 'Theological Hall 1F Men''s', 'men', false, 'Theological Hall', 1, 44.2256381, -76.4937055, 2, 3, 2, true),
('d51f82c2-dc70-5685-9407-3747309e79fd'::uuid, 'queens', 'Chernoff Hall 1F All-gender', 'all_gender', true, 'Chernoff Hall', 1, 44.2243678, -76.4988300, 3, 0, 2, true),
('5e24b110-6e07-515f-a239-a2710e9f3c46'::uuid, 'queens', 'Chernoff Hall 1F Women''s', 'women', false, 'Chernoff Hall', 1, 44.2241881, -76.4986545, 6, 0, 4, true),
('bfae1d3f-cabb-57c5-860c-2f48b59dbfaf'::uuid, 'queens', 'Chernoff Hall 1F Men''s', 'men', false, 'Chernoff Hall', 1, 44.2241881, -76.4990055, 2, 3, 2, true),
('a13cf25e-2a3d-523f-b406-5be70ed6a306'::uuid, 'queens', 'Chernoff Hall 2F All-gender', 'all_gender', true, 'Chernoff Hall', 2, 44.2245295, -76.4988300, 2, 0, 2, true),
('1c411f20-2ae4-5222-9141-7411c803bf22'::uuid, 'queens', 'Beamish-Munro Hall 1F All-gender', 'all_gender', true, 'Beamish-Munro Hall', 1, 44.2282378, -76.4923700, 3, 0, 2, true),
('52b241a5-6b4a-5f13-8891-877748901411'::uuid, 'queens', 'Beamish-Munro Hall 1F Women''s', 'women', false, 'Beamish-Munro Hall', 1, 44.2280581, -76.4921945, 6, 0, 4, true),
('54373209-e280-56cd-89f0-87b16035622b'::uuid, 'queens', 'Beamish-Munro Hall 1F Men''s', 'men', false, 'Beamish-Munro Hall', 1, 44.2280581, -76.4925455, 2, 3, 2, true),
('fa0313c9-3ca8-5ad4-88d1-3a5cda2efeac'::uuid, 'queens', 'Walter Light Hall 1F All-gender', 'all_gender', true, 'Walter Light Hall', 1, 44.2281178, -76.4917100, 3, 0, 2, true),
('95f70f6f-69f3-54ca-a9d0-6213ad4be730'::uuid, 'queens', 'Walter Light Hall 1F Women''s', 'women', false, 'Walter Light Hall', 1, 44.2279381, -76.4915345, 6, 0, 4, true),
('62421488-66ca-5c50-a2ee-3f30668a7b64'::uuid, 'queens', 'Walter Light Hall 1F Men''s', 'men', false, 'Walter Light Hall', 1, 44.2279381, -76.4918855, 2, 3, 2, true),
('476267f8-5f77-544a-9b77-384628a3f609'::uuid, 'queens', 'Dupuis Hall 1F All-gender', 'all_gender', true, 'Dupuis Hall', 1, 44.2286778, -76.4925500, 3, 0, 2, true),
('1b740c3a-16f0-5f01-a9af-03ec6fa4c8f3'::uuid, 'queens', 'Dupuis Hall 1F Women''s', 'women', false, 'Dupuis Hall', 1, 44.2284981, -76.4923745, 6, 0, 4, true),
('e924c405-ded9-5128-bb94-c1a1c76d4186'::uuid, 'queens', 'Dupuis Hall 1F Men''s', 'men', false, 'Dupuis Hall', 1, 44.2284981, -76.4927255, 2, 3, 2, true),
('5f43252d-b7f5-5539-8743-88648c77acea'::uuid, 'queens', 'Goodwin Hall 1F All-gender', 'all_gender', true, 'Goodwin Hall', 1, 44.2280478, -76.4923400, 3, 0, 2, true),
('7c1bb50b-c669-50b6-8a50-3ed5ef3778a4'::uuid, 'queens', 'Goodwin Hall 1F Women''s', 'women', false, 'Goodwin Hall', 1, 44.2278681, -76.4921645, 6, 0, 4, true),
('ab82329e-07b5-5b18-a5da-3279cbe0a7f2'::uuid, 'queens', 'Goodwin Hall 1F Men''s', 'men', false, 'Goodwin Hall', 1, 44.2278681, -76.4925155, 2, 3, 2, true),
('9b777148-1eb0-5124-b711-0dedb6c23973'::uuid, 'queens', 'Botterell Hall 1F All-gender', 'all_gender', true, 'Botterell Hall', 1, 44.2245078, -76.4915400, 3, 0, 2, true),
('3a924df9-25cc-51bd-9b22-240ac67541c9'::uuid, 'queens', 'Botterell Hall 1F Women''s', 'women', false, 'Botterell Hall', 1, 44.2243281, -76.4913645, 6, 0, 4, true),
('5dc5240e-c4a6-533f-aa8e-e3a17ac80605'::uuid, 'queens', 'Botterell Hall 1F Men''s', 'men', false, 'Botterell Hall', 1, 44.2243281, -76.4917155, 2, 3, 2, true),
('cf00ecfe-2db9-5695-8e6a-15bd4cf47abb'::uuid, 'queens', 'Miller Hall 1F All-gender', 'all_gender', true, 'Miller Hall', 1, 44.2274878, -76.4927400, 3, 0, 2, true),
('2ea319de-fcbd-5da6-af38-9b417cf56741'::uuid, 'queens', 'Miller Hall 1F Women''s', 'women', false, 'Miller Hall', 1, 44.2273081, -76.4925645, 6, 0, 4, true),
('6be621e5-9705-593a-b1a9-928c189f5bd8'::uuid, 'queens', 'Miller Hall 1F Men''s', 'men', false, 'Miller Hall', 1, 44.2273081, -76.4929155, 2, 3, 2, true),
('c18b7bf3-2f4a-55ff-967f-70fd82b1ae12'::uuid, 'queens', 'Humphrey Hall 1F All-gender', 'all_gender', true, 'Humphrey Hall', 1, 44.2269778, -76.4920800, 3, 0, 2, true),
('78d419ce-56b6-5018-940b-9b06f47717ea'::uuid, 'queens', 'Humphrey Hall 1F Women''s', 'women', false, 'Humphrey Hall', 1, 44.2267981, -76.4919045, 6, 0, 4, true),
('831961d8-be38-50ee-b001-988ce3294d9f'::uuid, 'queens', 'Humphrey Hall 1F Men''s', 'men', false, 'Humphrey Hall', 1, 44.2267981, -76.4922555, 2, 3, 2, true),
('94eabfd9-21d4-55ff-b7d7-38135fd297f1'::uuid, 'queens', 'Kinesiology Building 1F All-gender', 'all_gender', true, 'Kinesiology Building', 1, 44.2287478, -76.4933600, 3, 0, 2, true),
('f4b74d30-b261-53e7-9a51-d0d17c286c33'::uuid, 'queens', 'Kinesiology Building 1F Women''s', 'women', false, 'Kinesiology Building', 1, 44.2285681, -76.4931845, 6, 0, 4, true),
('25a94a1e-3254-54ac-a96e-ea2914771995'::uuid, 'queens', 'Kinesiology Building 1F Men''s', 'men', false, 'Kinesiology Building', 1, 44.2285681, -76.4935355, 2, 3, 2, true),
('27251c78-c98c-55a0-8947-a0f6e8aa4312'::uuid, 'queens', 'Richardson Hall 1F All-gender', 'all_gender', true, 'Richardson Hall', 1, 44.2269478, -76.4960600, 3, 0, 2, true),
('53586cd4-08a5-5c46-b72c-95d1a083fa4e'::uuid, 'queens', 'Richardson Hall 1F Women''s', 'women', false, 'Richardson Hall', 1, 44.2267681, -76.4958845, 6, 0, 4, true),
('8bd0d23d-d62e-5c92-bcc0-880648339435'::uuid, 'queens', 'Richardson Hall 1F Men''s', 'men', false, 'Richardson Hall', 1, 44.2267681, -76.4962355, 2, 3, 2, true);

insert into public.bathroom_reports (bathroom_id, cleanliness_rating, created_at) values
('d458c353-4d52-5ddc-98a1-9267287fd949'::uuid, 4.6, now()),
('39ab7850-5efa-5965-ab92-a9e4818ced03'::uuid, 4.1, now()),
('798cb61a-9ba3-549e-a23c-5918923367ab'::uuid, 2.1, now()),
('d8dc5802-ffa0-5a8b-94ea-bc388152fbe5'::uuid, 4.4, now()),
('464f4775-5004-54a9-833d-5c74931a30bb'::uuid, 3.8, now()),
('9b0e4624-ccad-56b4-9ccb-d89e1517dad0'::uuid, 4.0, now()),
('dc1d8e75-03c6-5844-85e3-0993bfd59c2b'::uuid, 3.5, now()),
('8005bf29-8261-5f78-afea-9f2cacbe3fe6'::uuid, 2.3, now()),
('95c6fb2c-8dc8-5b06-ba2d-c7bd28bc9b72'::uuid, 3.5, now()),
('8d6ed293-0421-55d9-a526-6ed7e840af3d'::uuid, 3.7, now()),
('13604b2b-65aa-52f4-ab4f-e1115cf71623'::uuid, 3.5, now()),
('ffcc1ed6-b5c9-5ea8-bd35-fa35028e5d08'::uuid, 3.5, now()),
('54ffb3ac-0b7a-5cbd-b4b1-002ae88274bd'::uuid, 3.5, now()),
('3feb95d4-5c42-5d1b-addb-ea9b11201231'::uuid, 4.8, now()),
('8f9c71f2-aa7f-5755-ad2e-df38ea990807'::uuid, 4.2, now()),
('49d043d9-16ae-5eec-aabd-5c5987af1063'::uuid, 3.1, now()),
('c60c2842-6d25-51f9-863b-270495da5b7a'::uuid, 3.5, now()),
('61deede4-10dc-58e7-8312-ccafa5a558db'::uuid, 4.9, now()),
('c91c3365-3dbd-5bcc-bc36-7ec3bd1ef1d9'::uuid, 4.5, now()),
('8a8366b3-793a-52a5-aa54-2c84728d59eb'::uuid, 3.6, now()),
('4bd2c385-3d3b-51b7-86dc-01f7747d8a0b'::uuid, 3.5, now()),
('700a4200-8ce1-54b4-b467-ff1466085068'::uuid, 3.5, now()),
('f11af25f-88db-5d10-9f2a-a6b1139a1fe8'::uuid, 3.5, now()),
('11c24d4d-3553-5b5f-be66-ec92c6f8c23b'::uuid, 3.5, now()),
('76677d1d-79f5-516e-8b68-56d617cbc108'::uuid, 3.5, now()),
('ffa566e9-08ef-5fe7-bf8d-001bf7e5d1f2'::uuid, 3.9, now()),
('223db1e2-dfc4-5da8-ac85-6aa6136e74b7'::uuid, 3.5, now()),
('d7064840-9029-5588-a367-33d582c6d7e5'::uuid, 3.5, now()),
('8c3d463f-fe71-5bfd-bf4b-3c646f9572eb'::uuid, 3.5, now()),
('70df8902-e9c0-5be1-8eb6-c8a94e6cb5c6'::uuid, 2.8, now()),
('4cd985af-5265-5fdb-871f-691cbcb147e5'::uuid, 3.5, now()),
('2731ad84-a269-54d4-8391-87bf8307f032'::uuid, 3.5, now()),
('481b55eb-f953-5d89-9caa-83633c277e20'::uuid, 3.5, now()),
('28643464-abc9-5ba7-931c-c8998fe4ae91'::uuid, 3.5, now()),
('6ab3468e-ea59-54ad-a236-6c3f9330f8fb'::uuid, 3.5, now()),
('4a3d3f08-6deb-590d-a8b6-141ad961d172'::uuid, 3.5, now()),
('7c7610f2-d800-526c-b61d-f25bf59f0dfe'::uuid, 3.5, now()),
('28f546b9-5309-5be9-9df5-451c695764e0'::uuid, 3.5, now()),
('2e111226-543d-5b9b-b204-368ddd556816'::uuid, 3.5, now()),
('9622de21-4e5f-5399-be48-2f3b15db6274'::uuid, 3.5, now()),
('c71685ff-3717-507d-809f-9f3293e18828'::uuid, 3.5, now()),
('1e1dda12-552c-50ce-a2ee-94938bc2e88d'::uuid, 3.5, now()),
('d51f82c2-dc70-5685-9407-3747309e79fd'::uuid, 3.5, now()),
('5e24b110-6e07-515f-a239-a2710e9f3c46'::uuid, 4.3, now()),
('bfae1d3f-cabb-57c5-860c-2f48b59dbfaf'::uuid, 3.5, now()),
('a13cf25e-2a3d-523f-b406-5be70ed6a306'::uuid, 3.5, now()),
('1c411f20-2ae4-5222-9141-7411c803bf22'::uuid, 3.5, now()),
('52b241a5-6b4a-5f13-8891-877748901411'::uuid, 3.5, now()),
('54373209-e280-56cd-89f0-87b16035622b'::uuid, 3.5, now()),
('fa0313c9-3ca8-5ad4-88d1-3a5cda2efeac'::uuid, 3.5, now()),
('95f70f6f-69f3-54ca-a9d0-6213ad4be730'::uuid, 3.5, now()),
('62421488-66ca-5c50-a2ee-3f30668a7b64'::uuid, 3.5, now()),
('476267f8-5f77-544a-9b77-384628a3f609'::uuid, 3.5, now()),
('1b740c3a-16f0-5f01-a9af-03ec6fa4c8f3'::uuid, 3.5, now()),
('e924c405-ded9-5128-bb94-c1a1c76d4186'::uuid, 3.5, now()),
('5f43252d-b7f5-5539-8743-88648c77acea'::uuid, 3.5, now()),
('7c1bb50b-c669-50b6-8a50-3ed5ef3778a4'::uuid, 3.5, now()),
('ab82329e-07b5-5b18-a5da-3279cbe0a7f2'::uuid, 3.5, now()),
('9b777148-1eb0-5124-b711-0dedb6c23973'::uuid, 3.5, now()),
('3a924df9-25cc-51bd-9b22-240ac67541c9'::uuid, 3.5, now()),
('5dc5240e-c4a6-533f-aa8e-e3a17ac80605'::uuid, 2.6, now()),
('cf00ecfe-2db9-5695-8e6a-15bd4cf47abb'::uuid, 3.5, now()),
('2ea319de-fcbd-5da6-af38-9b417cf56741'::uuid, 3.5, now()),
('6be621e5-9705-593a-b1a9-928c189f5bd8'::uuid, 3.5, now()),
('c18b7bf3-2f4a-55ff-967f-70fd82b1ae12'::uuid, 3.5, now()),
('78d419ce-56b6-5018-940b-9b06f47717ea'::uuid, 3.5, now()),
('831961d8-be38-50ee-b001-988ce3294d9f'::uuid, 3.5, now()),
('94eabfd9-21d4-55ff-b7d7-38135fd297f1'::uuid, 3.5, now()),
('f4b74d30-b261-53e7-9a51-d0d17c286c33'::uuid, 3.5, now()),
('25a94a1e-3254-54ac-a96e-ea2914771995'::uuid, 3.5, now()),
('27251c78-c98c-55a0-8947-a0f6e8aa4312'::uuid, 3.5, now()),
('53586cd4-08a5-5c46-b72c-95d1a083fa4e'::uuid, 3.5, now()),
('8bd0d23d-d62e-5c92-bcc0-880648339435'::uuid, 3.5, now());
