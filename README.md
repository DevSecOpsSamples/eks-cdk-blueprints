# CDK EKS Blueprints Sample

[![Build](https://github.com/DevSecOpsSamples/eks-cdk-blueprints/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/DevSecOpsSamples/eks-cdk-blueprints/actions/workflows/build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DevSecOpsSamples_eks-cdk-blueprints&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DevSecOpsSamples_eks-cdk-blueprints) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=DevSecOpsSamples_eks-cdk-blueprints&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=DevSecOpsSamples_eks-cdk-blueprints)

![Overview](./screenshots/diagram.png?raw=true)

With EKS Blueprints, you can create EKS clusters that are fully bootstrapped with the operational software that is needed to deploy and operate workloads.

You can create an EKS cluster with `eksctl`, `kops` and `CDK`, but many manual commands are required for operational software and add-on such as ClusterAutoScaler(CA), AwsLoadBalancerController, and MetricsServer.
With EKS Blueprints, you can configure operational softwares with only `cdk deploy` at a time.

## Prerequisites

```bash
npm install -g aws-cdk@2.20.0

# install packages in the root folder
npm install
cdk bootstrap
```

Use the `cdk` command-line toolkit to interact with your project:

* `cdk deploy`: deploys your app into an AWS account
* `cdk synth`: synthesizes an AWS CloudFormation template for your app
* `cdk diff`: compares your app with the deployed stack
* `cdk watch`: deployment every time a file change is detected

## Time To Complete

| Stack                         | Time    |
|-------------------------------|---------|
| VPC, EKS cluster, Add-on      | 23m     |
| Build                         | 1m      |
| Deploy(including ALB)         | 3m      |
| Total                         | 27m     |

## Install

### Step 1: VPC, EKS cluster, and add-on with Blueprints

```bash
cd ../blueprints
cdk deploy
# or cdk deploy -c stage=dev
```

[blueprints/bin/index.ts](./blueprints/bin/index.ts), [blueprints/lib/cluster-config.ts](./blueprints/lib/cluster-config.ts)

```bash
Outputs:
eks-blueprint-local.Cluster = eks-blueprint-local
eks-blueprint-local.ClusterArn = arn:aws:eks:us-east-1:123456789012:cluster/eks-blueprint-local
eks-blueprint-local.ClusterCertificateAuthorityData = xxxxxxxx
eks-blueprint-local.ClusterEncryptionConfigKeyArn = 
eks-blueprint-local.ClusterEndpoint = https://123456789012.gr7.us-east-1.eks.amazonaws.com
eks-blueprint-local.ClusterName = eks-blueprint-local
eks-blueprint-local.ClusterSecurityGroupId = sg-0123456789abc
eks-blueprint-local.VPC = vpc-0123456789abc
eks-blueprint-local.eksclusterConfigCommand515C0544 = aws eks update-kubeconfig --name eks-blueprint-local --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-blueprint-local-iamrole10180D71-D83FQPH1BRW3
eks-blueprint-local.eksclusterGetTokenCommand3C33A2A5 = aws eks get-token --cluster-name eks-blueprint-local --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-blueprint-local-iamrole10180D71-D83FQPH1BRW3
```

Pods

https://k9scli.io/topics/install/

![K9s Pod](./screenshots/pod.png?raw=true)

Services

![K9s Service](./screenshots/service.png?raw=true)

```bash
eksctl create iamidentitymapping --cluster <cluster-name> --arn arn:aws:iam::<account-id>:role/<role-name> --group system:masters --username admin --region us-east-1
```

If you want to create an EKS cluster with an Existing VPC, refer to the [ExistingVPC.md](./ExistingVPC.md) page.

### Step 2: Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml

kubectl apply -f k8s-dabboard/eks-admin-service-account.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

kubectl proxy
```

[Dashboard Login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

### Step 3: Build Sample RESTful API

Create an ECR for sample RESTful API:

```bash
REGION=$(aws configure get default.region)
aws ecr create-repository --repository-name sample-rest-api --region ${REGION}
```

Build and push to ECR:

```bash
cd app

REGION=$(aws configure get default.region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "ACCOUNT_ID: $ACCOUNT_ID"
echo "REGION: $REGION"

docker build -t sample-rest-api .
docker tag sample-rest-api:latest ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/sample-rest-api:latest
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/sample-rest-api:latest
```

### Step 4: Deploy Sample RESTful API

Create a YAML file for K8s Deployment, Service, HorizontalPodAutoscaler, and Ingress using a template file.

```bash
sed -e "s|<account-id>|${ACCOUNT_ID}|g" sample-rest-api-template.yaml | sed -e "s|<region>|${REGION}|g" > sample-rest-api.yaml
cat sample-rest-api.yaml
kubectl apply -f sample-rest-api.yaml
```

[app/sample-rest-api-template.yaml](./app/sample-rest-api-template.yaml)

## Destroy

```bash
cd blueprints
cdk destroy
```

## Reference

* [Blueprints Roadmap](https://github.com/aws-quickstart/eks-cdk-blueprints/projects/1)

* https://github.com/aws-quickstart/eks-cdk-blueprints

* https://aws-quickstart.github.io/eks-cdk-blueprints

## Link

* [https://github.com/DevSecOpsSamples/aws-container](https://github.com/DevSecOpsSamples/aws-container)

* [https://github.com/DevSecOpsSamples/cdk-eks](https://github.com/DevSecOpsSamples/cdk-eks)
