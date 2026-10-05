"""Generate the Queen's washroom migration from building centroids.

Pins are offset a few metres from each building so washrooms on the same
floor can be tapped separately. They are building-level estimates, not
surveyed stall coordinates.
"""

from __future__ import annotations

import math
import uuid
from pathlib import Path

# OpenStreetMap centroids, plus Nominatim address points for halls that
# are not tagged as their own building way.
BUILDINGS: list[tuple[str, float, float, list[int]]] = [
    ("Stauffer Library", 44.22853, -76.49620, [1, 2, 3]),
    ("Douglas Library", 44.22735, -76.49502, [1, 2]),
    ("Mackintosh-Corry Hall", 44.2265832, -76.4969721, [1, 2]),
    ("John Deutsch University Centre", 44.2284356, -76.4948911, [1, 2]),
    ("Queen's Centre", 44.22911, -76.49480, [1, 2]),
    ("Jeffery Hall", 44.22591, -76.49610, [1]),
    ("Ellis Hall", 44.22634, -76.49619, [1]),
    ("Stirling Hall", 44.22458, -76.49771, [1]),
    ("Watson Hall", 44.22556, -76.49742, [1]),
    ("Kingston Hall", 44.22569, -76.49488, [1]),
    ("Ontario Hall", 44.22657, -76.49504, [1]),
    ("Theological Hall", 44.22571, -76.49353, [1]),
    ("Chernoff Hall", 44.22426, -76.49883, [1, 2]),
    ("Beamish-Munro Hall", 44.22813, -76.49237, [1]),
    ("Walter Light Hall", 44.22801, -76.49171, [1]),
    ("Dupuis Hall", 44.22857, -76.49255, [1]),
    ("Goodwin Hall", 44.22794, -76.49234, [1]),
    ("Botterell Hall", 44.22440, -76.49154, [1]),
    ("Miller Hall", 44.22738, -76.49274, [1]),
    ("Humphrey Hall", 44.22687, -76.49208, [1]),
    ("Kinesiology Building", 44.22864, -76.49336, [1]),
    ("Richardson Hall", 44.22684, -76.49606, [1]),
]

# gender, accessible, north metres, east metres, stalls, urinals, sinks
FLOOR_ONE = [
    ("all_gender", True, 12, 0, 3, 0, 2),
    ("women", False, -8, 14, 6, 0, 4),
    ("men", False, -8, -14, 2, 3, 2),
]

RATINGS = {
    ("Stauffer Library", 1, "men"): 2.1,
    ("Stauffer Library", 1, "women"): 4.1,
    ("Stauffer Library", 1, "all_gender"): 4.6,
    ("Stauffer Library", 2, "all_gender"): 4.4,
    ("Stauffer Library", 3, "all_gender"): 3.8,
    ("John Deutsch University Centre", 1, "all_gender"): 4.8,
    ("John Deutsch University Centre", 1, "men"): 3.1,
    ("John Deutsch University Centre", 1, "women"): 4.2,
    ("Douglas Library", 1, "men"): 2.3,
    ("Douglas Library", 1, "all_gender"): 4.0,
    ("Queen's Centre", 1, "all_gender"): 4.9,
    ("Queen's Centre", 1, "women"): 4.5,
    ("Queen's Centre", 1, "men"): 3.6,
    ("Mackintosh-Corry Hall", 1, "all_gender"): 3.7,
    ("Chernoff Hall", 1, "women"): 4.3,
    ("Botterell Hall", 1, "men"): 2.6,
    ("Stirling Hall", 1, "men"): 2.8,
    ("Ellis Hall", 1, "women"): 3.9,
}


def shift(lat: float, lon: float, north_m: float, east_m: float) -> tuple[float, float]:
    lat2 = lat + north_m / 111_320
    lon2 = lon + east_m / (111_320 * math.cos(math.radians(lat)))
    return lat2, lon2


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def gender_name(gender: str) -> str:
    if gender == "women":
        return "Women's"
    if gender == "men":
        return "Men's"
    return "All-gender"


def main() -> None:
    bathroom_rows: list[str] = []
    report_rows: list[str] = []

    for building, lat, lon, floors in BUILDINGS:
        for floor in floors:
            options = FLOOR_ONE if floor == floors[0] else [("all_gender", True, 12, 0, 2, 0, 2)]
            for gender, accessible, north, east, stalls, urinals, sinks in options:
                north += (floor - 1) * 18
                pin_lat, pin_lon = shift(lat, lon, north, east)
                bathroom_id = uuid.uuid5(
                    uuid.NAMESPACE_URL, f"queens:{building}:{floor}:{gender}"
                )
                name = f"{building} {floor}F {gender_name(gender)}"
                bathroom_rows.append(
                    "("
                    f"{sql_str(str(bathroom_id))}::uuid, 'queens', {sql_str(name)}, "
                    f"{sql_str(gender)}, {'true' if accessible else 'false'}, "
                    f"{sql_str(building)}, {floor}, {pin_lat:.7f}, {pin_lon:.7f}, "
                    f"{stalls}, {urinals}, {sinks}, true)"
                )
                rating = RATINGS.get((building, floor, gender), 3.5)
                report_rows.append(
                    f"({sql_str(str(bathroom_id))}::uuid, {rating:.1f}, now())"
                )

    sql = f"""-- Bathroom Maps tables for Queen's University at Kingston.
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
{",\n".join(bathroom_rows)};

insert into public.bathroom_reports (bathroom_id, cleanliness_rating, created_at) values
{",\n".join(report_rows)};
"""

    out = Path(__file__).resolve().parents[1] / "supabase" / "migrations" / "20261005120000_queens_bathrooms.sql"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(sql)
    print(f"wrote {out} ({len(bathroom_rows)} bathrooms)")


if __name__ == "__main__":
    main()
