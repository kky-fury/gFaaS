

variable "ssh_key_name" {
  type = string
}

variable "ssh_key_value" {
  type = string
}

variable "ssh_private_key_file" {
  type = string
}

variable "security_group_name" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "secgroup_rules" {
  type = list
}

variable "instance_flavor_name" {
  type = string
}

variable "worker_count" {
  type = number
}

variable "master_count" {
  type = number
}

variable "instance_user" {
  type    = string
  default = "ubuntu"
}

variable "provider_name" {
  type = string
}
