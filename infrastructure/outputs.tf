output "cloudflare_access_aud" {
  description = "Set this value as CLOUDFLARE_ACCESS_AUD on the white-green-blog Worker."
  value       = cloudflare_zero_trust_access_application.admin.aud
}
