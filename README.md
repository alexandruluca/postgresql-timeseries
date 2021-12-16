# Efficient time series storage in PostgreSQL

This repo illustrates how to efficiently store and retrieve time series in PostgreSQL for mutiple tenants

et normalizedId = orgId.replace(/-/g, '');
		let tableName = `item_value_${normalizedId}`;

		let query = `
				
				`;

		await this.query(query, {
			replacements: {
				tableName,
				orgId
			},
			useMaster: true
		});

		await this.query(`SELECT create_parent('public.${tableName}','timestamp','native','weekly')`, {
			useMaster: true
		});
		await this.query(`UPDATE part_config SET retention_keep_table = false, retention = '2 month' WHERE parent_table = 'public.${tableName}'`, {
			useMaster: true
		});