-- This is an empty migration.CREATE UNIQUE INDEX unique_primary_address_per_client
CREATE UNIQUE INDEX unique_primary_address_per_client 
ON client_addresses (client_id) 
WHERE is_primary = TRUE;