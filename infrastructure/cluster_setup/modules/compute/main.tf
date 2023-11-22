terraform {
  required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}

resource "openstack_compute_instance_v2" "instance" {

  count = var.instance_count

  name = format("%s-%s-%s-%02d", "faas-shim", var.instance_role, var.provider_name, count.index)
  flavor_name = var.instance_flavor_name
  key_pair = var.ssh_key_name
  availability_zone = "nova"
  security_groups = ["default", var.security_group_name]


  block_device {
    uuid = "a51394b8-ffb6-4e04-a7a5-108d7ff58e52"
    source_type           = "image"
    volume_size           = 40
    boot_index            = 0
    destination_type      = "volume"
    delete_on_termination = true
  }

  network {
    name = "Mwn"
  }
}


resource "openstack_networking_floatingip_v2" "floatingip" {
  count = var.instance_count
  pool  = "MWN_pool"
}

# Create Floating IP associations
resource "openstack_compute_floatingip_associate_v2" "floatingip_associate_instance" {
    count       = var.instance_count
    floating_ip = openstack_networking_floatingip_v2.floatingip[count.index].address
    instance_id = openstack_compute_instance_v2.instance[count.index].id
}

data "null_data_source" "instances" {
  count = var.instance_count
  inputs = {
    name        = openstack_compute_instance_v2.instance[count.index].name
    id          = openstack_compute_instance_v2.instance[count.index].id
    internal_ip = openstack_compute_instance_v2.instance[count.index].access_ip_v4
    floating_ip = openstack_networking_floatingip_v2.floatingip[count.index].address
  }
}
