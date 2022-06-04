# CDK EKS Blueprints Sample

## Prequisets

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

## CDK Stack Time Taken

| Stack                         | Time    |
|-------------------------------|---------|
| VPC                           | 3m      |
| EKS cluster                   | 21m  (38 Stacks)   |
| Total                         | 24m     |

## Install

### Step 1: VPC

The VPC ID will be saved into the SSM parameter store to refer from other stacks.

Parameter Name : `/cdk-eks-blueprints/vpc-id`

Use the `-c vpcId` context parameter if you want to use the existing VPC.

```bash
cd vpc
cdk deploy
```

[vpc/lib/vpc-stack.ts](./vpc/lib/vpc-stack.ts)

If you want to create a new VPC and EKS cluster at a time, deploy using the following stack:

```bash
# 59 Stacks
cd ../blueprints-with-vpc
cdk deploy
```

 [blueprints-with-vpc/bin/index.ts](./blueprints-with-vpc/bin/index.ts)

### Step 2: EKS cluster and add-on with Blueprints

2 CDK stacks are created eks-blueprint-demo and `eks-blueprint-demo-dev`.

```bash
cd ../blueprints
cdk deploy eks-blueprint-demo-dev

# or define your VPC id with context parameter
cdk deploy eks-blueprint-demo-dev -c vpcId=<vpc-id>
```

Cluster Name: [blueprints/lib/cluster-config.ts](./blueprints/lib/cluster-config.ts)

[blueprints/lib/cluster-stack.ts](./blueprints/lib/cluster-stack.ts)

```bash
Outputs:
eks-blueprint-demo-dev.Cluster = eks-blueprint-demo
eks-blueprint-demo-dev.ClusterArn = arn:aws:eks:us-east-1:123456789012:cluster/eks-blueprint-demo
eks-blueprint-demo-dev.ClusterCertificateAuthorityData = xxxxxxxx
eks-blueprint-demo-dev.ClusterEncryptionConfigKeyArn = 
eks-blueprint-demo-dev.ClusterEndpoint = https://123456789012.gr7.us-east-1.eks.amazonaws.com
eks-blueprint-demo-dev.ClusterName = eks-blueprint-demo
eks-blueprint-demo-dev.ClusterSecurityGroupId = sg-0123456789abc
eks-blueprint-demo-dev.VPC = vpc-0123456789abc
eks-blueprint-demo-dev.eksclusterConfigCommand515C0544 = aws eks update-kubeconfig --name eks-blueprint-demo --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-blueprint-demo-dev-iamrole10180D71-D83FQPH1BRW3
eks-blueprint-demo-dev.eksclusterGetTokenCommand3C33A2A5 = aws eks get-token --cluster-name eks-blueprint-demo --region us-east-1 --role-arn arn:aws:iam::123456789012:role/eks-blueprint-demo-dev-iamrole10180D71-D83FQPH1BRW3
```

Pods

![K9s Pod](./screenshots/pod.png?raw=true)

Services

![K9s Service](./screenshots/service.png?raw=true)

```bash
eksctl create iamidentitymapping --cluster <cluster-name> --arn arn:aws:iam::<account-id>:role/<role-name> --group system:masters --username admin --region us-east-1
```

### Step 3: Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml

kubectl apply -f k8s-dabboard/eks-admin-service-account.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

kubectl proxy
```

[Dashboard Login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

### Step 4: Deploy Sample RESTful API

```bash
cd app

docker build -t sample-rest-api .

docker tag sample-rest-api:latest <account>.dkr.ecr.<region>.amazonaws.com/sample-rest-api:latest

aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker push <account>.dkr.ecr.<region>.amazonaws.com/sample-rest-api:latest

```

```bash
kubectl apply -f ./app/sample-rest-api.yaml
kubectl apply -f ./app/cpu-hpa.yaml
```

[app/sample-rest-api.yaml](./app/sample-rest-api.yaml)

## Destroy/Uninstall

```bash
cd ../blueprints
cdk destroy
cd ../vpc
cdk destroy

kubectl delete -f ./app/cpu-hpa.yaml
kubectl delete -f ./app/sample-rest-api.yaml
```

## Reference

https://github.com/aws-quickstart/cdk-eks-blueprints

https://aws-quickstart.github.io/cdk-eks-blueprints
