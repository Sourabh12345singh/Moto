# ecs.tf - ECS Fargate Cluster, Task Definitions, and Services

# 1. ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "motoshare-cluster"

  tags = {
    Name = "motoshare-cluster"
  }
}

# 2. CloudWatch Log Group for container logs
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/motoshare"
  retention_in_days = 7
}

# 3. ECS Task Execution IAM Role (required for ECS agent to pull images and push logs)
resource "aws_iam_role" "ecs_execution" {
  name = "motoshare-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 4. Backend Task Definition (Spring Boot)
resource "aws_ecs_task_definition" "backend" {
  family                   = "motoshare-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # 0.25 vCPU (cost-saving minimum)
  memory                   = "512" # 0.5 GB RAM (cost-saving minimum)
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.backend_image
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      environment = [
        { name = "DB_URL", value = "jdbc:postgresql://${aws_db_instance.postgres.endpoint}/${var.db_name}" },
        { name = "DB_USERNAME", value = var.db_username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "MAIL_USERNAME", value = var.mail_username },
        { name = "MAIL_PASSWORD", value = var.mail_password },
        { name = "FRONTEND_URLS", value = "http://${aws_lb.alb.dns_name}" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# 5. Frontend Task Definition (React + Nginx)
resource "aws_ecs_task_definition" "frontend" {
  family                   = "motoshare-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# 6. Backend Service (Runs the Spring Boot container task)
resource "aws_ecs_service" "backend" {
  name            = "motoshare-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.http]
}

# 7. Frontend Service (Runs the React/Nginx container task)
resource "aws_ecs_service" "frontend" {
  name            = "motoshare-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]
}
