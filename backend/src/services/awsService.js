const AWS = require("aws-sdk");
const AwsCredentials = require("../models/AwsCredentials");
const AwsResourceUsage = require("../models/AwsResourceUsage");

class AwsService {
  static async getAwsClient(userId, service = "ec2") {
    const credentials = await AwsCredentials.findOne({ userId });
    if (!credentials) {
      throw new Error("AWS credentials not found");
    }

    const config = {
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    };

    switch (service) {
      case "ec2":
        return new AWS.EC2(config);
      case "cloudwatch":
        return new AWS.CloudWatch(config);
      case "s3":
        return new AWS.S3(config);
      case "cloudfront":
        return new AWS.CloudFront(config);
      default:
        throw new Error(`Unsupported AWS service: ${service}`);
    }
  }

  static async getInstanceUsage(userId) {
    try {
      const ec2 = await this.getAwsClient(userId, "ec2");
      const cloudWatch = await this.getAwsClient(userId, "cloudwatch");

      // Get running instances
      const instances = await ec2.describeInstances().promise();
      const runningInstances = instances.Reservations.flatMap((reservation) =>
        reservation.Instances.filter(
          (instance) => instance.State.Name === "running"
        )
      );

      // Get metrics for each instance
      const instanceUsage = await Promise.all(
        runningInstances.map(async (instance) => {
          const endTime = new Date();
          const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // Last 24 hours

          const [cpuMetrics, memoryMetrics, diskMetrics] = await Promise.all([
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/EC2",
                MetricName: "CPUUtilization",
                Dimensions: [
                  { Name: "InstanceId", Value: instance.InstanceId },
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Average"],
              })
              .promise(),
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/EC2",
                MetricName: "MemoryUtilization",
                Dimensions: [
                  { Name: "InstanceId", Value: instance.InstanceId },
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Average"],
              })
              .promise(),
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/EC2",
                MetricName: "DiskUtilization",
                Dimensions: [
                  { Name: "InstanceId", Value: instance.InstanceId },
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Average"],
              })
              .promise(),
          ]);

          const cpuUtilization = cpuMetrics.Datapoints[0]?.Average || 0;
          const memoryUtilization = memoryMetrics.Datapoints[0]?.Average || 0;
          const diskUtilization = diskMetrics.Datapoints[0]?.Average || 0;

          // Calculate CO2 emissions based on instance type and utilization
          const co2Emissions = this.calculateInstanceCO2(
            instance.InstanceType,
            cpuUtilization,
            memoryUtilization,
            diskUtilization
          );

          return {
            instanceId: instance.InstanceId,
            instanceType: instance.InstanceType,
            region: instance.Placement.AvailabilityZone.slice(0, -1),
            runningHours: 24, // Assuming 24 hours for simplicity
            cpuUtilization,
            memoryUtilization,
            storageUsed: diskUtilization,
            co2Emissions,
            timestamp: new Date().toISOString(),
          };
        })
      );

      return instanceUsage;
    } catch (error) {
      console.error("Error getting instance usage:", error);
      throw error;
    }
  }

  static async getNetworkUsage(userId) {
    try {
      const cloudFront = await this.getAwsClient(userId, "cloudfront");
      const cloudWatch = await this.getAwsClient(userId, "cloudwatch");

      // Get CloudFront distributions
      const distributions = await cloudFront.listDistributions().promise();
      const distributionList = distributions.DistributionList.Items;

      // Get metrics for each distribution
      const networkUsage = await Promise.all(
        distributionList.map(async (distribution) => {
          const endTime = new Date();
          const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // Last 24 hours

          const [bytesDownloaded, bytesUploaded] = await Promise.all([
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/CloudFront",
                MetricName: "BytesDownloaded",
                Dimensions: [
                  { Name: "DistributionId", Value: distribution.Id },
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Sum"],
              })
              .promise(),
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/CloudFront",
                MetricName: "BytesUploaded",
                Dimensions: [
                  { Name: "DistributionId", Value: distribution.Id },
                ],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Sum"],
              })
              .promise(),
          ]);

          const totalBytes =
            (bytesDownloaded.Datapoints[0]?.Sum || 0) +
            (bytesUploaded.Datapoints[0]?.Sum || 0);
          const dataTransferGB = totalBytes / (1024 * 1024 * 1024);

          // Calculate CO2 emissions based on data transfer
          const co2Emissions = this.calculateNetworkCO2(dataTransferGB);

          return {
            distributionId: distribution.Id,
            dataTransferGB,
            co2Emissions,
            timestamp: new Date().toISOString(),
          };
        })
      );

      return networkUsage;
    } catch (error) {
      console.error("Error getting network usage:", error);
      throw error;
    }
  }

  static async getS3Usage(userId) {
    try {
      const s3 = await this.getAwsClient(userId, "s3");
      const cloudWatch = await this.getAwsClient(userId, "cloudwatch");

      // Get all S3 buckets
      const buckets = await s3.listBuckets().promise();
      const bucketList = buckets.Buckets;

      // Get metrics for each bucket
      const s3Usage = await Promise.all(
        bucketList.map(async (bucket) => {
          const endTime = new Date();
          const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // Last 24 hours

          const [bucketSize, numberOfRequests] = await Promise.all([
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/S3",
                MetricName: "BucketSizeBytes",
                Dimensions: [{ Name: "BucketName", Value: bucket.Name }],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Average"],
              })
              .promise(),
            cloudWatch
              .getMetricStatistics({
                Namespace: "AWS/S3",
                MetricName: "NumberOfObjects",
                Dimensions: [{ Name: "BucketName", Value: bucket.Name }],
                StartTime: startTime,
                EndTime: endTime,
                Period: 3600,
                Statistics: ["Average"],
              })
              .promise(),
          ]);

          const averageBucketSizeGB =
            (bucketSize.Datapoints[0]?.Average || 0) / (1024 * 1024 * 1024);
          const averageRequests = numberOfRequests.Datapoints[0]?.Average || 0;

          // Calculate CO2 emissions based on storage and requests
          const co2Emissions = this.calculateS3CO2(
            averageBucketSizeGB,
            averageRequests
          );

          return {
            bucketName: bucket.Name,
            sizeGB: averageBucketSizeGB,
            requests: averageRequests,
            co2Emissions,
            timestamp: new Date().toISOString(),
          };
        })
      );

      return s3Usage;
    } catch (error) {
      console.error("Error getting S3 usage:", error);
      throw error;
    }
  }

  // Helper methods for CO2 calculations
  static calculateInstanceCO2(
    instanceType,
    cpuUtilization,
    memoryUtilization,
    diskUtilization
  ) {
    // Simplified CO2 calculation based on instance type and utilization
    const baseEmissions = {
      "t2.micro": 0.1,
      "t2.small": 0.2,
      "t2.medium": 0.4,
      "t2.large": 0.8,
      "t2.xlarge": 1.6,
      "m5.large": 1.2,
      "m5.xlarge": 2.4,
      "m5.2xlarge": 4.8,
      "c5.large": 1.4,
      "c5.xlarge": 2.8,
      "c5.2xlarge": 5.6,
    };

    const baseEmission = baseEmissions[instanceType] || 1.0;
    const utilizationFactor =
      (cpuUtilization + memoryUtilization + diskUtilization) / 300;
    return baseEmission * utilizationFactor;
  }

  static calculateNetworkCO2(dataTransferGB) {
    // Simplified CO2 calculation for network transfer
    // Assuming 0.1 kg CO2 per GB of data transfer
    return dataTransferGB * 0.1;
  }

  static calculateS3CO2(sizeGB, requests) {
    // Simplified CO2 calculation for S3
    // Assuming 0.05 kg CO2 per GB of storage and 0.001 kg CO2 per request
    return sizeGB * 0.05 + requests * 0.001;
  }
}

module.exports = AwsService;
