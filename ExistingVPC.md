# CDK EKS Blueprints Sample

Reference: Resource Providers - https://aws-quickstart.github.io/cdk-eks-blueprints/resource-providers/

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

### Step 2: EKS cluster and add-on with Blueprints

2 CDK stacks are created eks-blueprint and `eks-blueprint-local`.

```bash
cd ../blueprints
cdk deploy eks-blueprint/local
# cdk deploy eks-blueprint/dev -c stage=dev

# or define your VPC id with context parameter
cdk deploy eks-blueprint/local -c vpcId=<vpc-id>
```

Cluster Name: [blueprints-existing-vpc/lib/cluster-config.ts](./blueprints-existing-vpc/lib/cluster-config.ts)

[blueprints-existing-vpc/lib/cluster-stack.ts](./blueprints-existing-vpc/lib/cluster-stack.ts)

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
