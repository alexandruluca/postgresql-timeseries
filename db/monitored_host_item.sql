create table monitored_host_item
(
	id uuid default uuid_generate_v4() not null
		constraint monitored_host_item_pkey
			primary key,
	host_id uuid default uuid_generate_v4() not null
		constraint monitored_host_item_host_id_fkey
			references hosts
				on update cascade on delete cascade,
	external_key varchar,
	external_id varchar,
	item_id uuid default uuid_generate_v4() not null
		constraint monitored_host_item_item_id_fkey
			references monitored_item
				on update cascade on delete cascade,
	enabled boolean not null,
	interval_s integer,
	last_loaded timestamp with time zone,
	created_at timestamp with time zone not null,
	updated_at timestamp with time zone not null,
	constraint monitored_host_item_host_id_item_id_key
		unique (host_id, item_id)
);