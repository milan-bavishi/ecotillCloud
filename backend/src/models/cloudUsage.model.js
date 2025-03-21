const mongoose = require('mongoose');

const cloudUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for better query performance
  },
  provider: {
    type: String,
    enum: ['aws', 'azure', 'gcp'],
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    compute: {
      instanceType: {
        type: String,
        required: true
      },
      cpuUtilization: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      runningHours: {
        type: Number,
        required: true,
        min: 0
      },
      instanceCount: {
        type: Number,
        required: true,
        min: 1
      },
      carbonEmission: {
        type: Number,
        default: 0
      }
    },
    storage: {
      storageType: {
        type: String,
        required: true
      },
      sizeGB: {
        type: Number,
        required: true,
        min: 0
      },
      accessFrequency: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      carbonEmission: {
        type: Number,
        default: 0
      }
    },
    network: {
      dataTransferGB: {
        type: Number,
        required: true,
        min: 0
      },
      cdnUsage: {
        type: Boolean,
        default: false
      },
      carbonEmission: {
        type: Number,
        default: 0
      }
    }
  },
  totalEmission: {
    type: Number,
    default: 0
  },
  recommendations: [{
    category: {
      type: String,
      enum: ['compute', 'storage', 'network'],
      required: true
    },
    suggestion: {
      type: String,
      required: true
    },
    potentialSaving: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true, // Add createdAt and updatedAt fields
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true }
});

// Add indexes for common queries
cloudUsageSchema.index({ userId: 1, timestamp: -1 });
cloudUsageSchema.index({ userId: 1, provider: 1, timestamp: -1 });

// Calculate carbon emissions before saving
cloudUsageSchema.pre('save', async function(next) {
  try {
    // Carbon emission factors (example values - should be updated with actual factors)
    const CARBON_FACTORS = {
      aws: {
        'us-east-1': 0.32,  // kg CO2e/kWh
        'eu-west-1': 0.19,
        'ap-southeast-1': 0.385
      },
      azure: {
        'eastus': 0.31,
        'northeurope': 0.18,
        'southeastasia': 0.38
      },
      gcp: {
        'us-east1': 0.33,
        'europe-west1': 0.20,
        'asia-southeast1': 0.39
      }
    };

    const factor = CARBON_FACTORS[this.provider]?.[this.region] || 0.35; // Default factor if region not found

    // Calculate compute emissions
    this.metrics.compute.carbonEmission = 
      (this.metrics.compute.cpuUtilization / 100) * 
      this.metrics.compute.runningHours * 
      this.metrics.compute.instanceCount * 
      factor;

    // Calculate storage emissions
    this.metrics.storage.carbonEmission = 
      (this.metrics.storage.sizeGB * 0.0024) * // Assumed power usage per GB
      factor * 
      (this.metrics.storage.accessFrequency / 100);

    // Calculate network emissions
    this.metrics.network.carbonEmission = 
      (this.metrics.network.dataTransferGB * 0.001) * // Network transfer energy factor
      factor * 
      (this.metrics.network.cdnUsage ? 0.7 : 1); // CDN usage reduction factor

    // Calculate total emission
    this.totalEmission = 
      this.metrics.compute.carbonEmission +
      this.metrics.storage.carbonEmission +
      this.metrics.network.carbonEmission;

    // Generate recommendations
    this.recommendations = [];

    // Compute recommendations
    if (this.metrics.compute.cpuUtilization < 50) {
      this.recommendations.push({
        category: 'compute',
        suggestion: 'Consider downsizing instances or implementing auto-scaling',
        potentialSaving: this.metrics.compute.carbonEmission * 0.3
      });
    }

    // Storage recommendations
    if (this.metrics.storage.accessFrequency < 20) {
      this.recommendations.push({
        category: 'storage',
        suggestion: 'Move infrequently accessed data to cold storage',
        potentialSaving: this.metrics.storage.carbonEmission * 0.4
      });
    }

    // Network recommendations
    if (!this.metrics.network.cdnUsage && this.metrics.network.dataTransferGB > 1000) {
      this.recommendations.push({
        category: 'network',
        suggestion: 'Implement CDN for frequently accessed content',
        potentialSaving: this.metrics.network.carbonEmission * 0.3
      });
    }

    next();
  } catch (error) {
    console.error('Error in cloudUsage pre-save middleware:', error);
    next(error);
  }
});

const CloudUsage = mongoose.model('CloudUsage', cloudUsageSchema);

module.exports = CloudUsage; 