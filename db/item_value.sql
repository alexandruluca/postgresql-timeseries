CREATE TABLE IF NOT EXISTS "item_value" (
    "organization_id" UUID NOT NULL, 
    "host_item_id" UUID NOT NULL, 
    "value" DOUBLE PRECISION, 
    "timestamp" TIMESTAMP WITH TIME ZONE
) partition by list("organization_id");


-- create a new partition for a customer
-- this ca be done on the application side or handled by a function
CREATE TABLE IF NOT EXISTS
				"item_value_$organization_partion_uuid" PARTITION OF
				item_value FOR VALUES IN ($org_uuid) PARTITION BY RANGE(timestamp);
                
-- partition the table weekly
SELECT create_parent('public.${item_value_$organization_partion_uuid}','timestamp','native','weekly')
-- set retention to two months
UPDATE part_config SET retention_keep_table = false, retention = '2 month', infinite_time_partitions = true WHERE parent_table = 'public.${item_value_$organization_partion_uuid}'