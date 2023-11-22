terraform {
  required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.35.0"
    }
  }
}

// Setup ssh-key for accessing the instances
resource "openstack_compute_keypair_v2" "ssh-key" {
  name       = var.ssh_key_name
  public_key = var.ssh_key_value
}

// Setup security groups
module "network"{
  source = "../network"
  secgroup_rules = var.secgroup_rules
  security_group_name = var.security_group_name
}

// Create master node(s)
module "master" {
  source = "../compute"
  instance_role = "master"
  instance_user = var.instance_user
  instance_count = var.master_count
  security_group_name = var.security_group_name
  ssh_key_name = var.ssh_key_name
  ssh_key_value = var.ssh_key_value
  instance_flavor_name = var.instance_flavor_name
  provider_name = var.provider_name
}

// Create worker node(s)
module "worker" {
  source = "../compute"
  instance_role = "worker"
  instance_user = var.instance_user
  instance_count = var.worker_count
  security_group_name = var.security_group_name
  ssh_key_name = var.ssh_key_name
  ssh_key_value = var.ssh_key_value
  instance_flavor_name = var.instance_flavor_name
  provider_name = var.provider_name
}


resource "local_file" "hosts" {
  content = templatefile("./templates/hosts.tpl",
  {
    cluster_name     = var.cluster_name
    master_instances = module.master.instances
    worker_instances = module.worker.instances
  }
  )
  filename = "./ansible/${var.cluster_name}_hosts.ini"
}

// Create ansible hosts file with master and workers instances
resource "null_resource" "ansible_master" {
  count = var.master_count
  triggers = {
    master_instance_id = module.master.instances[count.index].id
  }

  provisioner "remote-exec" {
    inline = ["#Connected"]

    connection {
      user        = var.instance_user
      host        = module.master.instances[count.index].floating_ip
      private_key = file(var.ssh_private_key_file)
      agent       = "true"
    }
  }

  provisioner "local-exec" {
    command = <<EOT
    cd ansible;
    ansible-playbook -i ${var.cluster_name}_hosts.ini master.yml
    EOT
  }
}

resource "null_resource" "ansible_worker" {
  count = var.worker_count
  triggers = {
    worker_instance_id = module.worker.instances[count.index].id
  }

  provisioner "remote-exec" {
    inline = ["#Connected"]

    connection {
      user        = var.instance_user
      host        = module.worker.instances[count.index].floating_ip
      private_key = file(var.ssh_private_key_file)
      agent       = "true"
    }
  }

  provisioner "local-exec" {
    command = <<EOT
    cd ansible;
    ansible-playbook -i ${var.cluster_name}_hosts.ini worker.yml
    EOT
  }
  depends_on = [null_resource.ansible_master]
}

//resource "null_resource" "ansible_master_after" {
//  count = 1
//  triggers = {
//    master_instance_id = module.master.instances[count.index].id
//  }
//
//  provisioner "remote-exec" {
//    inline = ["#Connected"]
//
//    connection {
//      user        = var.instance_user
//      host        = module.master.instances[count.index].floating_ip
//      private_key = file(var.ssh_private_key_file)
//      agent       = "true"
//    }
//  }
//
//  provisioner "local-exec" {
//    command = <<EOT
//    cd ansible;
//    ansible-playbook -i ${var.cluster_name}_hosts.ini master-after-join.yml
//    EOT
//  }
//  depends_on = [null_resource.ansible_worker]
//}

# Cleanup resources
//resource "null_resource" "cleanup" {
//  provisioner "local-exec" {
//    when    = destroy
//    command = <<EOT
//     rm -rf ./ansible/from_remote/*
//     EOT
//  }
//}
