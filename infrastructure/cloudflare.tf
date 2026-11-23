variable "cloudflare_api_token" {
  description = "Cloudflare API token configured in the HCP Terraform workspace."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account containing blog.white-green.net."
  type        = string
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  cloudflare_account_id = var.cloudflare_account_id
}
