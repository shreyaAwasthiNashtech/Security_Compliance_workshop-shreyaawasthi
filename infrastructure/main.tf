terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "public_bucket" {
  bucket = "my-public-bucket-demo"
  acl    = "public-read" # insecure - public access

  tags = {
    Name        = "PublicBucket"
    Environment = "Dev"
  }
}

resource "aws_db_instance" "rds_public" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro"
  username             = "admin"
  password             = "HardCodedPass123!" # Secret in code
  publicly_accessible  = true                # Security issue
  skip_final_snapshot  = true
}
