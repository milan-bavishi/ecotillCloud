const TravelHistory = require('../models/TravelHistory');

// Save a new travel record
exports.saveTravel = async (req, res) => {
  try {
    const { 
      source, 
      destination, 
      sourceCoords,
      destinationCoords, 
      transportMode,
      distance,
      co2Emissions
    } = req.body;

    // Get userId from authenticated user
    const userId = req.user.id;

    const newTravel = new TravelHistory({
      userId,
      source,
      destination,
      sourceCoords,
      destinationCoords,
      transportMode,
      distance,
      co2Emissions
    });

    await newTravel.save();
    
    res.status(201).json({
      success: true,
      data: newTravel
    });
  } catch (error) {
    console.error('Error saving travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all travel history for a user
exports.getUserTravelHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const travelHistory = await TravelHistory.find({ userId })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: travelHistory.length,
      data: travelHistory
    });
  } catch (error) {
    console.error('Error fetching travel history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get travel statistics for a user
exports.getUserTravelStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange } = req.query;
    
    // Build date filter based on timeRange
    let dateFilter = {};
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateFilter = { date: { $gte: weekAgo } };
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = { date: { $gte: monthAgo } };
    } else if (timeRange === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      dateFilter = { date: { $gte: yearAgo } };
    }
    
    // Get travel history with date filter
    const travelHistory = await TravelHistory.find({ 
      userId,
      ...dateFilter
    });
    
    // Calculate statistics
    const totalDistance = travelHistory.reduce((sum, trip) => sum + trip.distance, 0);
    const totalEmissions = travelHistory.reduce((sum, trip) => sum + trip.co2Emissions, 0);
    
    // Group by transport mode
    const transportModes = {};
    travelHistory.forEach(trip => {
      if (!transportModes[trip.transportMode]) {
        transportModes[trip.transportMode] = {
          mode: trip.transportMode,
          trips: 0,
          distance: 0,
          emissions: 0
        };
      }
      
      transportModes[trip.transportMode].trips += 1;
      transportModes[trip.transportMode].distance += trip.distance;
      transportModes[trip.transportMode].emissions += trip.co2Emissions;
    });
    
    // Calculate emissions saved vs. car travel
    let emissionsSaved = 0;
    travelHistory.forEach(trip => {
      if (trip.transportMode !== 'car') {
        const carEmissions = trip.distance * 170; // 170g CO2 per km
        emissionsSaved += (carEmissions - trip.co2Emissions);
      }
    });
    
    // Group by month for the last 6 months
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthTrips = travelHistory.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate >= monthStart && tripDate <= monthEnd;
      });
      
      monthlyData.unshift({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        emissions: monthTrips.reduce((sum, trip) => sum + trip.co2Emissions, 0),
        distance: monthTrips.reduce((sum, trip) => sum + trip.distance, 0),
        trips: monthTrips.length
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalTrips: travelHistory.length,
        totalDistance,
        totalEmissions,
        emissionsSaved,
        averageEmissionsPerKm: totalDistance > 0 ? totalEmissions / totalDistance : 0,
        transportModes: Object.values(transportModes),
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error fetching travel stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a travel record
exports.deleteTravel = async (req, res) => {
  try {
    const travel = await TravelHistory.findById(req.params.id);
    
    if (!travel) {
      return res.status(404).json({
        success: false,
        message: 'Travel record not found'
      });
    }
    
    // Check if user owns this travel record
    if (travel.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'User not authorized to delete this record'
      });
    }
    
    await travel.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting travel:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 