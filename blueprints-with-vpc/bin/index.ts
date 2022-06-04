import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as blueprints from '@aws-quickstart/eks-blueprints';

const app = new cdk.App();

const addOns: Array<blueprints.ClusterAddOn> = [
    new blueprints.addons.ClusterAutoScalerAddOn,
    new blueprints.addons.AwsLoadBalancerControllerAddOn,
    new blueprints.addons.MetricsServerAddOn,
    new blueprints.addons.ContainerInsightsAddOn,
    new blueprints.addons.VpcCniAddOn,
    new blueprints.addons.CoreDnsAddOn,
    new blueprints.addons.KubeProxyAddOn
];
const clusterProvider = new blueprints.GenericClusterProvider({
    version: eks.KubernetesVersion.V1_21,
    managedNodeGroups: [{
        id: "cpu-ng",
        minSize: 2,
        maxSize: 10,
        instanceTypes: [new ec2.InstanceType('c5.large')],
        nodeGroupCapacityType: eks.CapacityType.SPOT,
    }]
});
const eksBlueprint = blueprints.EksBlueprint.builder()
    .addOns(...addOns)
    .clusterProvider(clusterProvider)
    .enableControlPlaneLogTypes('api')
    .build(app, 'eks-blueprint');

eksBlueprint.getClusterInfo().nodeGroups?.forEach(n => {
    n.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
});
