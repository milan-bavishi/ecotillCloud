const CloudUsage = require('../models/cloudUsage.model');

/**
 * Record new cloud usage data
 */
exports.recordUsage = async (req, res) => {
  try {
    console.log('Received cloud usage data:', req.body);
    console.log('User context:', req.user);

    if (!req.user || !req.user._id) {
      console.error('No user context found');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const { provider, region, metrics } = req.body;

    // Validate required fields
    if (!provider || !region || !metrics) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: provider, region, or metrics'
      });
    }

    // Validate metrics structure
    if (!metrics.compute || !metrics.storage || !metrics.network) {
      return res.status(400).json({
        success: false,
        message: 'Invalid metrics structure. Required: compute, storage, and network metrics'
      });
    }

    // Create the cloud usage record
    const cloudUsage = await CloudUsage.create({
      userId: req.user._id,
      provider,
      region,
      metrics: {
        compute: {
          instanceType: metrics.compute.instanceType,
          cpuUtilization: Number(metrics.compute.cpuUtilization),
          runningHours: Number(metrics.compute.runningHours),
          instanceCount: Number(metrics.compute.instanceCount)
        },
        storage: {
          storageType: metrics.storage.storageType,
          sizeGB: Number(metrics.storage.sizeGB),
          accessFrequency: Number(metrics.storage.accessFrequency)
        },
        network: {
          dataTransferGB: Number(metrics.network.dataTransferGB),
          cdnUsage: Boolean(metrics.network.cdnUsage)
        }
      }
    });

    console.log('Created cloud usage record:', cloudUsage);

    res.status(201).json({
      success: true,
      data: cloudUsage
    });
  } catch (error) {
    console.error('Error recording cloud usage:', error);
    console.error('Stack trace:', error.stack);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again later.'
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to record cloud usage data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's cloud usage history with filters
 */
exports.getUsageHistory = async (req, res) => {
  try {
    console.log('Received request params:', req.query);
    console.log('User context:', req.user);

    if (!req.user || !req.user._id) {
      console.error('No user context found');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const {
      startDate,
      endDate,
      provider,
      region,
      timeframe = 'daily'
    } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (provider) filter.provider = provider;
    if (region) filter.region = region;

    console.log('MongoDB filter:', filter);

    // Get raw data
    const usageData = await CloudUsage.find(filter)
      .sort({ timestamp: 1 })
      .lean();

    console.log('Raw data from MongoDB:', usageData);

    if (!usageData || usageData.length === 0) {
      console.log('No data found for the given filters');
      return res.status(200).json({
        success: true,
        data: {
          usage: [],
          trends: null
        }
      });
    }

    // Aggregate data based on timeframe
    const aggregatedData = aggregateByTimeframe(usageData, timeframe);
    console.log('Aggregated data:', aggregatedData);

    // Calculate trends
    const trends = calculateTrends(aggregatedData);
    console.log('Calculated trends:', trends);

    res.status(200).json({
      success: true,
      data: {
        usage: aggregatedData,
        trends
      }
    });
  } catch (error) {
    console.error('Error in getUsageHistory:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cloud usage data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get recommendations based on usage patterns
 */
exports.getRecommendations = async (req, res) => {
  try {
    const latestUsage = await CloudUsage.findOne(
      { userId: req.user._id },
      { recommendations: 1 }
    ).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: latestUsage?.recommendations || []
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper function to aggregate data by timeframe
function aggregateByTimeframe(data, timeframe) {
  try {
    const aggregated = {};
    
    data.forEach(record => {
      if (!record || !record.timestamp) {
        console.warn('Invalid record found:', record);
        return;
      }

      let key;
      const date = new Date(record.timestamp);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found:', record.timestamp);
        return;
      }
      
      switch (timeframe) {
        case 'hourly':
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case 'daily':
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        case 'weekly':
          const week = getWeekNumber(date);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'monthly':
          key = date.toISOString().slice(0, 7); // YYYY-MM
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }
      
      if (!aggregated[key]) {
        aggregated[key] = {
          timestamp: key,
          compute: 0,
          storage: 0,
          network: 0,
          total: 0
        };
      }
      
      // Safely access nested properties
      const compute = record.metrics?.compute?.carbonEmission || 0;
      const storage = record.metrics?.storage?.carbonEmission || 0;
      const network = record.metrics?.network?.carbonEmission || 0;
      const total = record.totalEmission || 0;
      
      aggregated[key].compute += compute;
      aggregated[key].storage += storage;
      aggregated[key].network += network;
      aggregated[key].total += total;
    });
    
    return Object.values(aggregated);
  } catch (error) {
    console.error('Error in aggregateByTimeframe:', error);
    return [];
  }
}

// Helper function to calculate trends
function calculateTrends(data) {
  try {
    if (!Array.isArray(data) || data.length < 2) return null;
    
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (!current || !previous) return null;
    
    const calculateChange = (curr, prev) => {
      if (prev === 0) return 0;
      return ((curr - prev) / prev) * 100;
    };
    
    return {
      compute: calculateChange(current.compute, previous.compute),
      storage: calculateChange(current.storage, previous.storage),
      network: calculateChange(current.network, previous.network),
      total: calculateChange(current.total, previous.total)
    };
  } catch (error) {
    console.error('Error calculating trends:', error);
    return null;
  }
} 