// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');

const verifyToken = require('../middleware/verifyToken'); // Path to your verifyToken middleware



// add new order
router.post('/add', verifyToken, async (req, res) => {
  const { orderNumber, name, nameOfAdmin, idOfAdmin, emailOfAdmin, phone, city, order, detailedOrder, price, date, numberToOrderBy } = req.body;

  // Validate required fields and data types
  if (!orderNumber || !name || !nameOfAdmin || !idOfAdmin || !emailOfAdmin || !phone || !city || !order || !detailedOrder || !price || !date || !numberToOrderBy) {
    return res.status(400).json({
      message: 'Missing required fields',
      fields: {
        orderNumber: !!orderNumber,
        name: !!name,
        nameOfAdmin: !!nameOfAdmin,
        idOfAdmin: !!idOfAdmin,
        emailOfAdmin: !!emailOfAdmin,
        phone: !!phone,
        city: !!city,
        order: !!order,
        detailedOrder: !!detailedOrder,
        price: !!price,
        date: !!date,
        numberToOrderBy: !!numberToOrderBy,
      },
    });
  }

  // Validate numeric fields using typeof or isNaN
  try {
    const parsedPrice = parseFloat(price);
    const parsedNumberToOrderBy = parseFloat(numberToOrderBy);
    const parsedOrderNumber = parseFloat(orderNumber);

    if (parsedPrice!==price || parsedNumberToOrderBy!==numberToOrderBy || parsedOrderNumber!==orderNumber) {
      return res.status(400).json({
        message: 'Invalid data types for price or numberToOrderBy or orderNumber',
      });
    }

    const newOrder = new Order({
      orderNumber,
      name,
      nameOfAdmin,
      idOfAdmin,
      emailOfAdmin,
      phone,
      city,
      order,
      detailedOrder,
      price, 
      date,
      numberToOrderBy, 
    });

    try {
      const savedOrder = await newOrder.save();
      res.status(201).json(savedOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } catch (err) {
    // Handle potential parsing errors (e.g., non-numeric strings)
    return res.status(400).json({ message: 'Invalid data format for numeric fields' });
  }
});














// get all orders or sum and count and search and limit and sortBy
router.get('/',verifyToken, async (req, res) => {


  const idOfAdmin = req.query.idOfAdmin;

  // Check if idOfAdmin is provided
  if (!idOfAdmin) {
    return res.status(400).json({ message: 'idOfAdmin is required to retrieve orders.' });
  }


  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'numberToOrderBy';
  const sortOrder = req.query.sortOrder || 'desc';
  // const searchQuery = {};
  
  const searchQuery = { idOfAdmin };


  if (idOfAdmin) {
   searchQuery.idOfAdmin = idOfAdmin;
  }

  // Parse search queries from query parameters
  const searchParams = req.query.searchParams;
  if (searchParams) {
    const queryParams = searchParams.split(',');
    for (const param of queryParams) {
      const [field, value] = param.split(':');
      if (field && value) {
        if (field === 'price' || field === 'orderNumber') {
          searchQuery[field] = parseFloat(value);
        } else {
          searchQuery[field] = { $regex: value, $options: 'i' };
        }
      }
    }
  }

  // Check for sum=true and sumField=price
  const calculateSum = req.query.sum === 'true';
  const calculateCount = req.query.count === 'true';


  try {


    if (calculateSum&&calculateCount) {
      // Perform aggregation to get the sum of prices
      const sumResult = await Order.aggregate([
        { $match: searchQuery },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);

      const sum = sumResult.length > 0 ? sumResult[0].total : 0;

      // Perform aggregation to get the count of orders
      const AllOrders = await Order.aggregate([
        { $match: searchQuery }
      ]);

      const count = AllOrders.length;
      res.json({ sum,count });

    } else if (calculateSum&&!calculateCount) {
      // Perform aggregation to get the sum of prices
      const sumResult = await Order.aggregate([
        { $match: searchQuery },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]);

      const sum = sumResult.length > 0 ? sumResult[0].total : 0;
      res.json({ sum });

    } else if (!calculateSum&&calculateCount){

      // Perform aggregation to get the count of orders
      const AllOrders = await Order.aggregate([
        { $match: searchQuery }
      ]);

      const count = AllOrders.length;
      res.json({ count });

    } else {

      // Perform pagination, sorting, and search for order listing
      const orders = await Order.find(searchQuery)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});












// الحصول على طلب معين
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});









// تعديل طلب معين
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const orderData = await Order.findById(req.params.id);
    if (orderData == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }

    // التأكد من أن جميع الحقول المطلوبة موجودة في الطلب
    const { name, phone, city, order, detailedOrder, price } = req.body;
    if (!name || !phone || !city || !order || !detailedOrder || !price) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        fields: {
          name: !!name,
          phone: !!phone,
          city: !!city,
          order: !!order,
          detailedOrder: !!detailedOrder,
          price: !!price
        }
      });
    }

    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        message: 'Invalid data type for price',
      });
    }

    // تحديث الحقول
    orderData.name = name;
    orderData.phone = phone;
    orderData.city = city;
    orderData.order = order;
    orderData.detailedOrder = detailedOrder;
    orderData.price = parsedPrice;

    const updatedOrder = await orderData.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});












// حذف طلب معين
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: 'Cannot find order' });
    }
    await order.remove();
    res.json({ message: 'Deleted Order' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






















// // Get sum and count orders within a specific range based on numberToOrderBy
// router.post('/allowGetTotalPriceAndCount',verifyToken, async (req, res) => {
//   try {


//     const idOfAdmin = req.query.idOfAdmin;

//     // Check if idOfAdmin is provided
//     if (!idOfAdmin) {
//       return res.status(400).json({ message: 'idOfAdmin is required to retrieve orders.' });
//     }

//     let { numberToOrderByStart, numberToOrderByEnd } = req.body;
//     // Parse query parameters from the request body
//     numberToOrderByStart = parseInt(numberToOrderByStart);
//     numberToOrderByEnd = parseInt(numberToOrderByEnd);

//     // Validate query parameters
//     if (isNaN(numberToOrderByStart) || isNaN(numberToOrderByEnd)) {
//       return res.status(400).json({ message: 'Invalid numberToOrderByStart and numberToOrderByEnd' + numberToOrderByStart + " " + numberToOrderByEnd });
//     }


//     let rangeQuery = { $gte: numberToOrderByStart, $lt: numberToOrderByEnd };

//     // Aggregate pipeline to find orders within the specified range
//     // const ordersJson = await Order.find({
 
//     //   numberToOrderBy: rangeQuery

//     // });




//     // Count the number of orders within the specified range
//     const count = await Order.countDocuments({
//       numberToOrderBy: rangeQuery
//     });



//     // Aggregate pipeline to find orders within the specified range and calculate sum
//     const orders = await Order.aggregate([
//       {
//         $match: {
//           numberToOrderBy: rangeQuery
//         }
//       },
//       { 
//         $group: {
//           _id: null,
//           total: { $sum: '$price' } 
//         } 
//       }
//     ]);

//     // Extract count and sum from the aggregation result

//     const sum = orders.length > 0 ? orders[0].total : 0;

//     // Construct the response object
//     const result = {
//       count,
//       sum
//     };

//     // Send the response
//     res.json(result);
//   } catch (err) {
//     // Handle errors
//     res.status(500).json({ message: err.message });
//   }
// });





// Get sum and count orders within a specific range based on numberToOrderBy
router.post('/allowGetTotalPriceAndCount', verifyToken, async (req, res) => {
  try {
    const idOfAdmin = req.query.idOfAdmin;

    // Check if idOfAdmin is provided
    if (!idOfAdmin) {
      return res.status(400).json({ message: 'idOfAdmin is required to retrieve orders.' });
    }

    let { numberToOrderByStart, numberToOrderByEnd } = req.body;
    // Parse query parameters from the request body
    numberToOrderByStart = parseInt(numberToOrderByStart);
    numberToOrderByEnd = parseInt(numberToOrderByEnd);

    // Validate query parameters
    if (isNaN(numberToOrderByStart) || isNaN(numberToOrderByEnd)) {
      return res.status(400).json({ message: 'Invalid numberToOrderByStart and numberToOrderByEnd: ' + numberToOrderByStart + " " + numberToOrderByEnd });
    }

    let rangeQuery = { $gte: numberToOrderByStart, $lt: numberToOrderByEnd };

    // Count the number of orders within the specified range and with the specified idOfAdmin
    const count = await Order.countDocuments({
      numberToOrderBy: rangeQuery,
      idOfAdmin: idOfAdmin
    });

    // Aggregate pipeline to find orders within the specified range, with the specified idOfAdmin, and calculate sum
    const orders = await Order.aggregate([
      {
        $match: {
          numberToOrderBy: rangeQuery,
          idOfAdmin: idOfAdmin
        }
      },
      { 
        $group: {
          _id: null,
          total: { $sum: '$price' } 
        } 
      }
    ]);

    // Extract sum from the aggregation result
    const sum = orders.length > 0 ? orders[0].total : 0;

    // Construct the response object
    const result = {
      count,
      sum
    };

    // Send the response
    res.json(result);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: err.message });
  }
});












module.exports = router;
