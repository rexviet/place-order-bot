variable "profile" {
  type        = string
  description = "AWS profile to use"
  default     = "default"
}

variable "region" {
  type        = string
  description = "AWS region create resources"
  default     = "ap-southeast-1"
}

variable "bot_key" {
  type        = string
}

variable "api_key" {
  type        = string
}

variable "secret_key" {
  type        = string
}

variable "passphrase" {
  type        = string
}
