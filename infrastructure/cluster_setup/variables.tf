

variable "cluster_name" {
  type = string
  default = "faas-shim"
}

variable "security_group_name" {
  type = string
  default = "faas-shim"
}

variable "provider_name" {
  type = string
  default = "knative"
}

variable "ssh_key_name" {
  type = string
  default = "paul-wieland-keypair"
}

variable "ssh_private_key_file" {
  type = string
  default = "./private_key.pem"
}

variable "ssh_key_value" {
  type = string
  default = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCoCg7Np+Cm8Uw1Z7P+dwePsaWJrh8F8enKRK0jkQAKT9bkRP127GGIR+vqw+LdROzWeusd12tniotB3/26mQCnsdnSXD7xOLk+JCdXL4w7h3HnzudfMVH7yWTCo4+xEN5WZ0lPDO+8/yoFkOUVvSin4nTqa1DFtQcltfpb0ESu7Rxz0T4kt/D2iK17t/VR2da5ZrBWgddjpgEbwFJX2Ac0Ds/U+XeKrulWmoG6bA95uPyPeJK7g4W83QjyrxboFdVKIIIYemBDz2VnhppKjy74xq90lf3TJBhlaTkZztRUMTzjwgWmuFER7h4Zjvl1g7rvgDs1yE54Mk/hu1+5Mdmx Generated-by-Nova"
}

variable "instance_flavor_name" {
  type = string
  default = "lrz.xlarge"
}

variable "worker_count" {
  type = number
  default = 2
}

variable "master_count" {
  type = number
  default = 1
}

variable "secgroup_rules" {
  type = list
  default = [
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 22 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 6443 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 80 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 443 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 31001 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 31002 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 31003 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 31004 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 30007 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10000 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10002 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10003 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10004 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10350 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 10550 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 9100 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 9090 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 3000 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 5602 },
    { cidr = "0.0.0.0/0", ip_protocol = "tcp", port = 31112 }
  ]
}
