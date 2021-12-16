create table hosts
(
    id serial not null
        constraint hosts_pkey primary key,
    name            varchar(255)                          not null,
    organization_id uuid
        constraint hosts_organization_id_fkey references organizations
            on update cascade on delete cascade
);