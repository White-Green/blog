variable "admin_email" {
  description = "Administrator email configured in HCP Terraform and as the Worker's ADMIN_EMAIL."
  type        = string
  sensitive   = true
  nullable    = false

  validation {
    condition     = trimspace(var.admin_email) != ""
    error_message = "admin_email must contain the administrator's email address."
  }
}

resource "cloudflare_zero_trust_access_policy" "admin" {
  account_id = local.cloudflare_account_id
  name       = "white-green-blog-admin-email"
  decision   = "allow"

  include = [{
    email = {
      email = trimspace(var.admin_email)
    }
  }]
}

resource "cloudflare_zero_trust_access_application" "admin" {
  account_id       = local.cloudflare_account_id
  name             = "white-green-blog-admin"
  type             = "self_hosted"
  domain           = "blog.white-green.net/admin"
  session_duration = "24h"

  policies = [{
    id         = cloudflare_zero_trust_access_policy.admin.id
    precedence = 1
  }]
}
