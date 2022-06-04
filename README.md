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

![K9s Pod](./screenshots/pod.png?raw=true)

Services

![K9s Service](./screenshots/service.png?raw=true)

```bash
eksctl create iamidentitymapping --cluster <cluster-name> --arn arn:aws:iam::<account-id>:role/<role-name> --group system:masters --username admin --region us-east-1
```

If you want to create an EKS cluster in the existing VPC, refer to the [ExistingVPC.md](./ExistingVPC.md) page.

### Step 2: Kubernetes Dashboard

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml

kubectl apply -f k8s-dabboard/eks-admin-service-account.yaml

kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')

kubectl proxy
```

[Dashboard Login](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

### Step 3: Deploy Sample RESTful API

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

[Blueprints Roadmap](https://github.com/aws-quickstart/cdk-eks-blueprints/projects/1)

https://www.npmjs.com/package/aws-cdk

https://github.com/aws-quickstart/cdk-eks-blueprints

https://aws-quickstart.github.io/cdk-eks-blueprints
