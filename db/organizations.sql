create table organizations
(
    id  serial not null
        constraint organizations_pkey primary key,
    name varchar(255)                    not null
);