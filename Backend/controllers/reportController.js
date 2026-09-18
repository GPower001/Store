import Item from "../models/Item.js";
import Branch from "../models/branchModel.js";
import mongoose from "mongoose";

/**
 * @desc Get inventory valuation report
 * @route GET /api/reports/inventory-valuation
 * @access Private
 */
export const getInventoryValuation = async (req, res) => {
  try {
    const { branchId, category, startDate, endDate } = req.query;
    const tenantId = req.user.tenantId;

    // Build filter
    const filter = { tenantId, isDeleted: false };
    
    if (branchId) filter.branchId = branchId;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get items with valuation
    const items = await Item.find(filter)
      .populate('branchId', 'name location')
      .lean();

    // Calculate valuations
    const valuationByCategory = {};
    const valuationByBranch = {};
    let totalValue = 0;
    let totalItems = 0;
    let totalQuantity = 0;

    items.forEach(item => {
      const itemValue = item.openingQty * item.price;
      totalValue += itemValue;
      totalItems += 1;
      totalQuantity += item.openingQty;

      // By category
      if (!valuationByCategory[item.category]) {
        valuationByCategory[item.category] = {
          category: item.category,
          totalValue: 0,
          totalQuantity: 0,
          itemCount: 0
        };
      }
      valuationByCategory[item.category].totalValue += itemValue;
      valuationByCategory[item.category].totalQuantity += item.openingQty;
      valuationByCategory[item.category].itemCount += 1;

      // By branch
      const branchName = item.branchId?.name || 'Unknown';
      if (!valuationByBranch[branchName]) {
        valuationByBranch[branchName] = {
          branch: branchName,
          totalValue: 0,
          totalQuantity: 0,
          itemCount: 0
        };
      }
      valuationByBranch[branchName].totalValue += itemValue;
      valuationByBranch[branchName].totalQuantity += item.openingQty;
      valuationByBranch[branchName].itemCount += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalValue: totalValue.toFixed(2),
          totalItems,
          totalQuantity,
          averageValuePerItem: totalItems > 0 ? (totalValue / totalItems).toFixed(2) : 0
        },
        byCategory: Object.values(valuationByCategory),
        byBranch: Object.values(valuationByBranch),
        items: items.map(item => ({
          _id: item._id,
          name: item.name,
          category: item.category,
          quantity: item.openingQty,
          price: item.price,
          value: (item.openingQty * item.price).toFixed(2),
          branch: item.branchId?.name || 'Unknown'
        }))
      }
    });
  } catch (error) {
    console.error("Inventory Valuation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory valuation report",
      error: error.message
    });
  }
};

/**
 * @desc Get stock trends report
 * @route GET /api/reports/stock-trends
 * @access Private
 */
export const getStockTrends = async (req, res) => {
  try {
    const { branchId, days = 30 } = req.query;
    const tenantId = req.user.tenantId;

    const filter = { tenantId, isDeleted: false };
    if (branchId) filter.branchId = branchId;

    // Get current stock levels
    const items = await Item.find(filter)
      .populate('branchId', 'name')
      .lean();

    // Analyze stock levels
    const lowStockItems = [];
    const outOfStockItems = [];
    const overstockItems = [];
    const healthyStockItems = [];

    items.forEach(item => {
      const stockLevel = {
        _id: item._id,
        name: item.name,
        category: item.category,
        currentStock: item.openingQty,
        minStock: item.minStock || 10,
        price: item.price,
        branch: item.branchId?.name || 'Unknown'
      };

      if (item.openingQty === 0) {
        outOfStockItems.push(stockLevel);
      } else if (item.openingQty <= (item.minStock || 10)) {
        lowStockItems.push(stockLevel);
      } else if (item.openingQty > (item.minStock || 10) * 5) {
        overstockItems.push(stockLevel);
      } else {
        healthyStockItems.push(stockLevel);
      }
    });

    // Calculate category trends
    const categoryTrends = {};
    items.forEach(item => {
      if (!categoryTrends[item.category]) {
        categoryTrends[item.category] = {
          category: item.category,
          totalItems: 0,
          totalQuantity: 0,
          lowStock: 0,
          outOfStock: 0,
          averageStock: 0
        };
      }
      categoryTrends[item.category].totalItems += 1;
      categoryTrends[item.category].totalQuantity += item.openingQty;
      if (item.openingQty === 0) categoryTrends[item.category].outOfStock += 1;
      if (item.openingQty <= (item.minStock || 10)) categoryTrends[item.category].lowStock += 1;
    });

    Object.values(categoryTrends).forEach(trend => {
      trend.averageStock = trend.totalItems > 0 
        ? (trend.totalQuantity / trend.totalItems).toFixed(2) 
        : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalItems: items.length,
          outOfStock: outOfStockItems.length,
          lowStock: lowStockItems.length,
          overstock: overstockItems.length,
          healthyStock: healthyStockItems.length
        },
        stockAlerts: {
          critical: outOfStockItems,
          warning: lowStockItems,
          overstock: overstockItems
        },
        categoryTrends: Object.values(categoryTrends)
      }
    });
  } catch (error) {
    console.error("Stock Trends Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock trends report",
      error: error.message
    });
  }
};

/**
 * @desc Get top performing items
 * @route GET /api/reports/top-items
 * @access Private
 */
export const getTopItems = async (req, res) => {
  try {
    const { branchId, limit = 10, sortBy = 'value' } = req.query;
    const tenantId = req.user.tenantId;

    const filter = { tenantId, isDeleted: false };
    if (branchId) filter.branchId = branchId;

    const items = await Item.find(filter)
      .populate('branchId', 'name')
      .lean();

    // Calculate item values and sort
    const itemsWithMetrics = items.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.openingQty,
      price: item.price,
      totalValue: item.openingQty * item.price,
      branch: item.branchId?.name || 'Unknown',
      minStock: item.minStock || 10
    }));

    // Sort based on criteria
    let sortedItems;
    if (sortBy === 'quantity') {
      sortedItems = itemsWithMetrics.sort((a, b) => b.quantity - a.quantity);
    } else if (sortBy === 'price') {
      sortedItems = itemsWithMetrics.sort((a, b) => b.price - a.price);
    } else {
      sortedItems = itemsWithMetrics.sort((a, b) => b.totalValue - a.totalValue);
    }

    res.status(200).json({
      success: true,
      data: {
        topItems: sortedItems.slice(0, parseInt(limit)),
        bottomItems: sortedItems.slice(-parseInt(limit)).reverse(),
        sortBy
      }
    });
  } catch (error) {
    console.error("Top Items Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate top items report",
      error: error.message
    });
  }
};

/**
 * @desc Get category analysis
 * @route GET /api/reports/category-analysis
 * @access Private
 */
export const getCategoryAnalysis = async (req, res) => {
  try {
    const { branchId } = req.query;
    const tenantId = req.user.tenantId;

    const filter = { tenantId, isDeleted: false };
    if (branchId) filter.branchId = branchId;

    const items = await Item.find(filter).lean();

    // Analyze by category
    const categoryData = {};
    
    items.forEach(item => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = {
          category: item.category,
          itemCount: 0,
          totalQuantity: 0,
          totalValue: 0,
          averagePrice: 0,
          minPrice: Infinity,
          maxPrice: 0,
          items: []
        };
      }

      const cat = categoryData[item.category];
      cat.itemCount += 1;
      cat.totalQuantity += item.openingQty;
      cat.totalValue += item.openingQty * item.price;
      cat.minPrice = Math.min(cat.minPrice, item.price);
      cat.maxPrice = Math.max(cat.maxPrice, item.price);
      cat.items.push({
        name: item.name,
        quantity: item.openingQty,
        price: item.price
      });
    });

    // Calculate averages and format
    const analysis = Object.values(categoryData).map(cat => ({
      category: cat.category,
      itemCount: cat.itemCount,
      totalQuantity: cat.totalQuantity,
      totalValue: cat.totalValue.toFixed(2),
      averagePrice: (cat.totalValue / cat.totalQuantity || 0).toFixed(2),
      priceRange: {
        min: cat.minPrice === Infinity ? 0 : cat.minPrice,
        max: cat.maxPrice
      },
      percentageOfTotal: 0 // Will calculate below
    }));

    const totalValue = analysis.reduce((sum, cat) => sum + parseFloat(cat.totalValue), 0);
    analysis.forEach(cat => {
      cat.percentageOfTotal = totalValue > 0 
        ? ((parseFloat(cat.totalValue) / totalValue) * 100).toFixed(2)
        : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        categories: analysis.sort((a, b) => parseFloat(b.totalValue) - parseFloat(a.totalValue)),
        summary: {
          totalCategories: analysis.length,
          totalValue: totalValue.toFixed(2),
          totalItems: items.length
        }
      }
    });
  } catch (error) {
    console.error("Category Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate category analysis",
      error: error.message
    });
  }
};

/**
 * @desc Get branch comparison report
 * @route GET /api/reports/branch-comparison
 * @access Private
 */
export const getBranchComparison = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    // Get all branches
    const branches = await Branch.find({ tenantId, isDeleted: false }).lean();
    
    // Get items for each branch
    const branchData = await Promise.all(
      branches.map(async (branch) => {
        const items = await Item.find({
          tenantId,
          branchId: branch._id,
          isDeleted: false
        }).lean();

        const totalValue = items.reduce((sum, item) => sum + (item.openingQty * item.price), 0);
        const totalQuantity = items.reduce((sum, item) => sum + item.openingQty, 0);
        const lowStockCount = items.filter(item => item.openingQty <= (item.minStock || 10)).length;
        const outOfStockCount = items.filter(item => item.openingQty === 0).length;

        return {
          branchId: branch._id,
          branchName: branch.name,
          location: branch.location,
          itemCount: items.length,
          totalValue: totalValue.toFixed(2),
          totalQuantity,
          averageValuePerItem: items.length > 0 ? (totalValue / items.length).toFixed(2) : 0,
          lowStockCount,
          outOfStockCount,
          healthScore: items.length > 0 
            ? (((items.length - outOfStockCount - lowStockCount) / items.length) * 100).toFixed(2)
            : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        branches: branchData.sort((a, b) => parseFloat(b.totalValue) - parseFloat(a.totalValue)),
        summary: {
          totalBranches: branches.length,
          totalValue: branchData.reduce((sum, b) => sum + parseFloat(b.totalValue), 0).toFixed(2),
          totalItems: branchData.reduce((sum, b) => sum + b.itemCount, 0)
        }
      }
    });
  } catch (error) {
    console.error("Branch Comparison Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate branch comparison report",
      error: error.message
    });
  }
};

/**
 * @desc Export report data
 * @route GET /api/reports/export
 * @access Private
 */
export const exportReport = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    const tenantId = req.user.tenantId;

    let data;
    
    // Get data based on report type
    switch (type) {
      case 'inventory':
        const items = await Item.find({ tenantId, isDeleted: false })
          .populate('branchId', 'name')
          .lean();
        data = items.map(item => ({
          Name: item.name,
          Category: item.category,
          Quantity: item.openingQty,
          Price: item.price,
          Value: (item.openingQty * item.price).toFixed(2),
          Branch: item.branchId?.name || 'Unknown',
          MinStock: item.minStock || 10
        }));
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type"
        });
    }

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data,
        count: data.length
      });
    }
  } catch (error) {
    console.error("Export Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: error.message
    });
  }
};