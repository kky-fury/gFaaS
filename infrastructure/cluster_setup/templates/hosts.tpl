[${cluster_name}:children]
master
worker

[master]
%{ for instance in master_instances ~}
${instance.name} ansible_host=${instance.floating_ip} internal_ip=${instance.internal_ip}
%{ endfor ~}

[worker]
%{ for instance in worker_instances ~}
${instance.name} ansible_host=${instance.floating_ip} internal_ip=${instance.internal_ip}
%{ endfor ~}

[all:vars]
ansible_python_interpreter=/usr/bin/python3