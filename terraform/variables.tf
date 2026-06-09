variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "motoshare"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  default     = "motoshare_admin"
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key (minimum 32 characters)"
  type        = string
  sensitive   = true
}

variable "mail_username" {
  description = "Gmail address for notifications"
  type        = string
}

variable "mail_password" {
  description = "Gmail App Password for SMTP authentication"
  type        = string
  sensitive   = true
}

variable "cloudinary_cloud_name" {
  description = "Cloudinary Cloud Name"
  type        = string
  default     = "drgrb8k9t"
}

variable "cloudinary_upload_preset" {
  description = "Cloudinary Upload Preset"
  type        = string
  default     = "motoshare_kyc"
}

variable "backend_image" {
  description = "Docker image for the Spring Boot Backend"
  type        = string
  default     = "sourabhsinghrathore/motoshare-backend:latest"
}

variable "frontend_image" {
  description = "Docker image for the React Frontend"
  type        = string
  default     = "sourabhsinghrathore/motoshare-frontend:latest"
}

variable "google_client_id" {
  description = "Google Client ID for OAuth 2.0"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google Client Secret for OAuth 2.0"
  type        = string
  sensitive   = true
  default     = ""
}

