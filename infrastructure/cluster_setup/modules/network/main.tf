terraform {
  required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}


// Security Groups

# Create a Secutiry Group for k8s
resource "openstack_networking_secgroup_v2" "secgroup" {
  name        = var.security_group_name
  description = "faas shim security group"
}

# Create a Secutiry Group Rules for k8s
resource "openstack_networking_secgroup_rule_v2" "secgroup_rules" {
  count = length(var.secgroup_rules)

  direction = "ingress"
  ethertype = "IPv4"

  protocol          = var.secgroup_rules[count.index].ip_protocol
  port_range_min    = var.secgroup_rules[count.index].port
  port_range_max    = var.secgroup_rules[count.index].port
  remote_ip_prefix  = var.secgroup_rules[count.index].cidr
  security_group_id = openstack_networking_secgroup_v2.secgroup.id
}
