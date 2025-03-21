const AWS = require("aws-sdk");
const AwsCredentials = require("../models/AwsCredentials");
const AwsResourceUsage = require("../models/AwsResourceUsage");

class AwsService {
  static async getAwsClient(userId) {
    const credentials = await AwsCredentials.findOne({ userId });
    if (!credentials) {
      throw new Error("AWS credentials not found");
    }

    return new AWS.EC2({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region,
    });
  }

  static async getInstanceUsage(userId) {
    const ec2 = await this.getAwsClient(userId);

    // Get EC2 instances
    const instances = await ec2.describeInstances().promise();

    // Get CloudWatch metrics for each instance
    const cloudWatch = new AWS.CloudWatch({
      accessKeyId: (await AwsCredentials.findOne({ userId })).accessKeyId,
      secretAccessKey: (await AwsCredentials.findOne({ userId }))
        .secretAccessKey,
      region: (await AwsCredentials.findOne({ userId })).region,
    });

    const usageData = [];

    for (const reservation of instances.Reservations) {
      for (const instance of reservation.Instances) {
        if (instance.State.Name === "running") {
          // Get CPU utilization
          const cpuData = await cloudWatch
            .getMetricStatistics({
              Namespace: "AWS/EC2",
              MetricName: "CPUUtilization",
              Dimensions: [{ Name: "InstanceId", Value: instance.InstanceId }],
              StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
              EndTime: new Date(),
              Period: 3600,
              Statistics: ["Average"],
            })
            .promise();

          // Calculate average CPU utilization
          const avgCpuUtilization =
            cpuData.Datapoints.reduce((acc, curr) => acc + curr.Average, 0) /
            cpuData.Datapoints.length;

          // Calculate CO2 emissions based on instance type and usage
          const co2Emissions = this.calculateCO2Emissions(
            instance.InstanceType,
            avgCpuUtilization
          );

          const usage = new AwsResourceUsage({
            userId,
            instanceId: instance.InstanceId,
            instanceType: instance.InstanceType,
            region: instance.Placement.AvailabilityZone,
            runningHours: 24, // Assuming 24-hour period
            cpuUtilization: avgCpuUtilization,
            memoryUtilization: 0, // Would need additional CloudWatch metrics
            storageUsed: 0, // Would need additional CloudWatch metrics
            co2Emissions,
          });

          await usage.save();
          usageData.push(usage);
        }
      }
    }

    return usageData;
  }

  static calculateCO2Emissions(instanceType, cpuUtilization) {
    // This is a simplified calculation. In reality, you would need more accurate data
    // about power consumption per instance type and regional energy mix
    const baseEmissions = {
      "t2.micro": 0.1,
      "t2.small": 0.2,
      "t2.medium": 0.4,
      "t2.large": 0.8,
      "t2.xlarge": 1.6,
      // Add more instance types as needed
    };

    const baseEmission = baseEmissions[instanceType] || 0.5;
    return baseEmission * (cpuUtilization / 100);
  }
}

module.exports = AwsService;
