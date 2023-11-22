
# Cluster Setup

This project contains [Terraform](https://www.terraform.io) and [Ansible](https://www.ansible.com) configurations to setup a working kubernetes cluster with several nodes, which can be configured in ``variables.tf``. Currently, only the [OpenStack Provider](https://registry.terraform.io/providers/terraform-provider-openstack/openstack/latest/docs) is supported.

> **_NOTE:_**  Replace the keypair and keep your private key secret.

## Setup Provider

Login to the LRZ Cloud, which is based on OpenStack, and download the ``clouds.yml`` file in order to provide authentication and provider information to Terraform.
In Order to authenticate, on must add the password for the given user like below.

````
clouds:
  openstack:
    auth:
      auth_url: https://cc.lrz.de:5000/v3
      username: "di57yiq"
      password: "ADD_PASSWORD_HERE"
      project_id: 7f53401d72334267834cb905175865b5
      project_name: "di57yiq"
      user_domain_name: "ADS"
    region_name: "RegionOne"
    interface: "public"
    identity_api_version: 3

````

## Apply terraform

Execute 

```
terraform apply -auto-approve
```

to start the cluster creation. First, Terraform will create VMs which are then used by Ansible to setup the kubernetes cluster.
The Initialization and cluster join is done automatically.

Execute

 ```
terraform destroy -auto-approve
```

to destroy the created Terraform resources.

## Install FaaS Provider

#### OpenFaaS
Use ``./ansible/roles/openfaas/main.yml`` to install OpenFaaS on Kubernetes.

#### Knative
Use ``./ansible/roles/knative/main.yml`` to install Knative on Kubernetes.

#### Fission
Use ``./ansible/roles/fission/main.yml`` to install Fission on Kubernetes.

#### Nuclio
Use ``./ansible/roles/nuclio/main.yml`` to install Nuclio on Kubernetes.

## Setup Ingress

#### Install

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
```

```
helm install nginxingress ingress-nginx/ingress-nginx
```

#### Setup Ingress

```
kubectl apply -f <ingress-provider.yml>
```

> **_NOTE:_**  Replace the host value with the address of your ingress machine. [sslip.io](https://sslip.io) is used avoid external domain name setup. This is very useful for development, use your own domain name for production. 

###### ingress-openfaas.yml
```
#ingress-openfaas.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gateway
  namespace: openfaas
  annotations:
   kubernetes.io/ingress.class: "nginx"
   nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: 10.195.8.172.sslip.io
      http:
        paths:
          - path: /.*
            pathType: Prefix
            backend:
              service:
                name:  gateway-external
                port:
                  number: 8080
```

> **_NOTE:_**  The Nuclio Dashboard required docker to be installed.

###### ingress-nuclio.yml

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-nuclio
  namespace: default
  annotations:
   kubernetes.io/ingress.class: "nginx"
   nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: 10.195.9.71.sslip.io
      http:
        paths:
          - path: /.*
            pathType: Prefix
            backend:
              service:
                name: nuclio-dashboard
                port:
                  number: 8070
```

###### ingress-fission.yml

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-fission
  namespace: fission
  annotations:
   kubernetes.io/ingress.class: "nginx"
   nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: 10.195.7.135.sslip.io
      http:
        paths:
          - path: /v2/.*
            pathType: Prefix
            backend:
              service:
                name: controller
                port:
                  number: 80
          - path: /.*
            pathType: Prefix
            backend:
              service:
                name: router
                port:
                  number: 80
```

> **_NOTE:_**  The fission controller is responsible for management tasks, the fission router can invoke functions if there is a http trigger.

###### Kourier setup for Knative

For Knative, on can use Kourier as Ingress, which is well integrated and works with in a few steps.
One has to replace the ```<PUBLIC_KOURIER_IP>``` by the IP Adress on which the Ingress Service can be reached from outside. In my case I replaced it with ```10.195.9.220.sslip.io```.

```
    kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.8.1/kourier.yaml
    kubectl patch configmap/config-network --namespace knative-serving --type merge --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'
    kubectl --namespace kourier-system get service kourier
    kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.8.3/serving-default-domain.yaml
    kubectl patch configmap/config-domain -n knative-serving --type merge -p '{"data":{"<PUBLIC_KOURIER_IP>":""}}'
```

Install ```cert-manager``` to provide TLS certificate to the Kourier ingress.

```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
```

## Install Metrics Server for Fission

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### Enable insecure TLS for Development

```
kubectl edit deploy -n kube-system metrics-server
```

Add ```- --kubelet-insecure-tls``` to ars list.
