# security_groups.tf - Firewall Isolation Chain

# 1. ALB Security Group (Public facing)
resource "aws_security_group" "alb" {
  name        = "motoshare-alb-sg"
  description = "Allows public HTTP traffic to the Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Public HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "motoshare-alb-sg"
  }
}

# 2. Frontend Container Security Group (Restricted to ALB only)
resource "aws_security_group" "frontend" {
  name        = "motoshare-frontend-sg"
  description = "Allows traffic to frontend containers only from the ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "motoshare-frontend-sg"
  }
}

# 3. Backend Container Security Group (Restricted to ALB only)
resource "aws_security_group" "backend" {
  name        = "motoshare-backend-sg"
  description = "Allows traffic to backend container only from the ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "API traffic from ALB"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "motoshare-backend-sg"
  }
}

# 4. Database Security Group (Restricted to Backend Container only)
resource "aws_security_group" "db" {
  name        = "motoshare-db-sg"
  description = "Allows database connection only from the backend container"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from Backend Service"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    description = "Deny all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "motoshare-db-sg"
  }
}
