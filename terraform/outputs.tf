output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer. Visit this URL to access your application."
  value       = "http://${aws_lb.alb.dns_name}"
}

output "rds_endpoint" {
  description = "The connection endpoint for the RDS PostgreSQL database."
  value       = aws_db_instance.postgres.endpoint
}
