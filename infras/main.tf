terraform {
  backend "s3" {
    # Replace this with your bucket name!
    bucket = "future-order-bot"
    key    = "terraform.tfstate"
    region = "ap-southeast-1"
    # Replace this with your DynamoDB table name!
    dynamodb_table = "future-order-bot-locks"
    encrypt        = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.47"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.4.3"
    }
    null = {
      source  = "hashicorp/null"
      version = "3.2.1"
    }
  }
  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = var.profile
  region  = var.region
}

module "bot-service" {
  source = "./services/bot"

  bot_key = var.bot_key
  api_key = var.api_key
  secret_key = var.secret_key
  passphrase = var.passphrase
}
