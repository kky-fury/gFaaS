# Ansible 

Ansible is used to automate the server setup. It includes setting up a Kubernetes Cluster and deploying the proper FaaS platform. The hosts file must contain the list of hosts which should be prepared. 
- [Install CLI](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

- Target platform: Ubuntu-20.04-LTS-focal

#### Note
The service setup is only for development purpose.

##### Sources

- https://kubernetes.io/blog/2019/03/15/kubernetes-setup-using-ansible-and-vagrant/
- https://blog.radwell.codes/2021/05/provisioning-single-node-kubernetes-cluster-using-kubeadm-on-ubuntu-20-04/

##### Show hosts
- ansible all --list-hosts -i hosts 

##### Ping hosts

This command should return SUCCESS for all listed hosts.

- ansible all -m ping -i hosts -u ubuntu

#### Install kubernetes (Single-node cluster) and FaaS-Platform

##### OpenFaaS

- ansible-playbook -i hosts.yaml openfaas.yaml -u ubuntu
- OpenFaaS gateway can be reached on port 31112
- Get the admin password: kubectl -n openfaas get secret basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode
- [Install OpenFaaS on Kubernetes](https://docs.openfaas.com/deployment/kubernetes/)

##### Nuclio

- ansible-playbook -i hosts.yaml nuclio.yaml -u ubuntu
- Nuclio gateway can be reached on port 31112
- DockerHub is used as docker registry
- [Install Nuclio on Kubernetes](https://github.com/nuclio/nuclio/blob/development/docs/setup/k8s/running-in-production-k8s.md#the-preferred-deployment-method)

##### Fission

- ansible-playbook -i hosts.yaml fission.yaml -u ubuntu
- The Fission Controller (API Gateway) can be reached on port 31112
- [Install Fission on Kubernetes](https://fission.io/docs/installation/)

##### Knative

- ansible-playbook -i hosts.yaml knative.yaml -u ubuntu

###### Setup API-Token (Valid for 300 days)
- kubectl create token controller -n knative-serving --duration=7200h


###### Optional: Setup Kuberentes Dashboard

1. Install the dashbord:
    - kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-beta8/aio/deploy/alternative.yaml
2. Enable bypass login
    - kubectl -n kubernetes-dashboard edit deployment kubernetes-dashboard
    - add --enable-skip-login 
3. Change type from ClusterIp to NodePort
    - kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
4. Get the port of the service
    - kubectl -n kubernetes-dashboard get service kubernetes-dashboard
5. Open the port you see in the Security groups of the VM
6. After that you can access the dashboard at vm_ip:portnum
