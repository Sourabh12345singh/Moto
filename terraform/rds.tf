# rds.tf - Managed PostgreSQL Instance

resource "aws_db_instance" "postgres" {
  identifier             = "motoshare-db-instance"
  engine                 = "postgres"
  engine_version         = "16.6"
  instance_class         = "db.t4g.micro" # cost-effective Graviton2 instance
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_group.name
  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot    = true # set false in production to prevent data loss on deletion
  publicly_accessible    = true

  tags = {
    Name        = "motoshare-db"
    Environment = var.environment
  }
}
