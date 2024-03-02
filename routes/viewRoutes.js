const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Alpha',
//   });
// });

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);


module.exports = router;
