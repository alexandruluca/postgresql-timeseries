create table organizations
(
    id   uuid default uuid_generate_v4() not null
        constraint organizations_pkey primary key,
    name varchar(255)                    not null
);