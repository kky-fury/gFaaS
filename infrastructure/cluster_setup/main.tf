
terraform {
  required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}
# Configure the OpenStack provider
provider "openstack" {
  cloud = "openstack"
}

module "faas_shim_cluster" {
  source = "./modules/cluster"
  secgroup_rules = var.secgroup_rules
  security_group_name = var.security_group_name
  ssh_key_name = var.ssh_key_name
  ssh_key_value = var.ssh_key_value
  instance_flavor_name = var.instance_flavor_name
  worker_count = var.worker_count
  master_count = var.master_count
  ssh_private_key_file = var.ssh_private_key_file
  cluster_name = var.cluster_name
  provider_name = var.provider_name
}
