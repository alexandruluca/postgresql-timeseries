# Efficient time series storage in PostgreSQL

This repo illustrates how to efficiently store and retrieve time series in PostgreSQL for mutiple tenants

1) It illustrates on how to do it with sequelize (ORM), this method patches sequelize as it does not allow any partitioning
2) The relevant table queries along with indexes are exported in the ./db folder