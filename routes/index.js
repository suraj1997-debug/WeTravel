var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var multer = require('multer')
var path = require('path');
var jwt = require('jsonwebtoken');

var userModule = require('../modules/user'); 
var destinationCatModule = require('../modules/destination_category');
var packageCatModule = require('../modules/package_category');
var CreatePackageModule = require('../modules/create_package');
var PackagedestModule = require('../modules/create_package_destination');
var BookingModule = require('../modules/booking');
var contactModule = require('../modules/contact');
var flightBookModule = require('../modules/flight_booking');
var travelBookModule = require('../modules/travel_booking');
var createHotelModule = require('../modules/create_hotel_package');
var bookingHotelModule = require('../modules/hotel_booking');

var getuser = userModule.find({});
var getdestinationCat = destinationCatModule.find({});
var getpackageCat = packageCatModule.find({});
var getcreatePackage = CreatePackageModule.find({});
var getpackageDestination = PackagedestModule.find({});

var getContact = contactModule.find({});
var getBooking = BookingModule.find({});
var getFlightBooking = flightBookModule.find({});
var getTravelBooking = travelBookModule.find({});
var getHotelPackage = createHotelModule.find({});
var getHotelBooking = bookingHotelModule.find({});

router.use(express.static(__dirname + "./public/"));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});




var destinationupload = multer({
  storage: Storage
}).single(['dest_img']);


var packageupload = multer({
  storage: Storage
}).single(['package_img']);


var packagedestupload = multer({
  storage: Storage
}).single(['packagedest_img']);

var packagehotelupload = multer({
  storage: Storage
}).single(['hotel_img']);


/* GET home page. */


function checkLoginUser(req, res, next) {


  try {
    if (req.session.user) {
      var userToken = localStorage.getItem('userToken');
      var decoded = jwt.verify(userToken, 'loginToken');
    }
    else {
      if (req.session.admin) {
        var adminToken = localStorage.getItem('adminToken');
        var decoded = jwt.verify(adminToken, 'adminloginToken');
      }
      else {
        res.redirect('/');
      }
    }
  } catch (err) {
    res.redirect('/');
  }
  next();
}


function checkedEmail(req, res, next) {
  var email = req.body.email;
  var checkexistEmail = userModule.findOne({ email: email });
  checkexistEmail.exec(function (err, data) {
    if (err) throw err;
    if (data) {
      res.render('signup', { title: 'WeTravel', msg: 'Email Already Exists' });
    }
    next();
  });

}

function checkedUser(req, res, next) {
  var uname = req.body.uname;
  var checkexistUser = userModule.findOne({ username: uname });
  checkexistUser.exec(function (err, data) {
    if (err) throw err;
    if (data) {
      res.render('signup', { title: 'WeTravel', msg: 'Username Already Exists' });
    }
    next();
  });

}



router.get('/', function (req, res, next) {

  if (req.session.user) {

    res.redirect('/index');

  } else {
    if (req.session.admin) {
      res.redirect('/dashboard');
    }
    else {
      res.render('login', { title: 'WeTravel', msg: '' });
    }


  }

});


router.post('/', function (req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;


  var checkLogin = userModule.findOne({ username: username });


  checkLogin.exec((err, data) => {
    if (err) throw err;

    var getuserid = data._id;
    var getpassword = data.password;

    if (bcrypt.compareSync(password, getpassword)) {

      if (data.username == 'admin') {
        var token = jwt.sign({ userid: getuserid }, 'adminloginToken');
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', username);
        req.session.admin = username;
        res.redirect('/dashboard');
      }
      else {
        var token = jwt.sign({ userid: getuserid }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginUser', username);
        req.session.user = username;
        res.redirect('/index');

      }
    }
    else {
      res.render('login', { title: 'WeTravel', msg: 'Invalid Username and password' });
    }
  });


});


router.get('/signup', function (req, res, next) {


  if (req.session.user) {

    res.redirect('/index');

  } else {
    if (req.session.admin) {
      res.redirect('/dashboard');
    }

    else {
      res.render('signup', { title: 'WeTravel', msg: '' });
    }

  }


});



router.post('/signup', checkedUser, checkedEmail, function (req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;

  if (password != confpassword) {
    res.render('signup', { title: 'WeTravel', msg: 'Password not Matched' });
  }
  else {
    password = bcrypt.hashSync(req.body.password, 10);
    var userDetails = new userModule({
      username: username,
      email: email,
      password: password
    });

    userDetails.save(function (err, doc) {
      if (err) throw err;
      res.render('signup', { title: 'WeTravel', msg: 'User Registered Successfully' });
    });
  }


});




router.get('/index', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    getcreatePackage.exec((err,data1)=>{
      if(err) throw err;
      getHotelPackage.exec((err,data)=>{
        if(err) throw err;
    res.render('index', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record:data1, records: data, success: '' });
  });
  });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      getcreatePackage.exec((err,data1)=>{
        if(err) throw err;
        getHotelPackage.exec((err,data)=>{
          if(err) throw err;
      res.render('index', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record:data1, records:data, success: '' });
    });
    });
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/flights_booking', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    getcreatePackage.exec((err,data1)=>{
      if(err) throw err;
    res.render('flight_booking', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record:data1,records:'', success: '' });
  });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      getcreatePackage.exec((err,data1)=>{
        if(err) throw err;
      res.render('flight_booking', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record:data1,records:'', success: '' });
    });
    }
    else {
      res.redirect('/');
    }
  }
});



router.post('/flights_booking', checkLoginUser, function (req, res, next) {
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');

   var name = req.body.name;
   var phone = req.body.phone;
   var email = req.body.email;
   var flying_from =req.body.flying_from;
   var flying_to = req.body.flying_to;
   var arrival_date =req.body.arrival_date;
   var departure_date =req.body.departure_date;
   var no_of_adults = req.body.no_of_adults;
   var no_of_children = req.body.no_of_children;
   var min_price = req.body.min_price;
   var max_price = req.body.max_price;

    var FlightBookDetails = new flightBookModule({
        Name: name,
        Phone: phone,
        Email: email,
        Flying_From: flying_from,
        Flying_To: flying_to,
        Arrival_Date: arrival_date,
        Departure_Date: departure_date,
        No_of_Adults: no_of_adults,
        No_of_Children: no_of_children,
        Min_Price:min_price,
        Max_Price: max_price
    });

    FlightBookDetails.save(function (err, data) {
      if (err) throw err;
      getcreatePackage.exec((err,data1)=>{
        if(err) throw err;
      res.render('flight_booking', { title: 'WeTravel', loginUser: loginUser, adminUser:'', records: data,record:data1, success: 'Booked Successfully!!' });
    });
  });
  } else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');

      var name = req.body.name;
      var phone = req.body.phone;
      var email = req.body.email;
      var flying_from =req.body.flying_from;
      var flying_to = req.body.flying_to;
      var arrival_date =req.body.arrival_date;
      var departure_date =req.body.departure_date;
      var no_of_adults = req.body.no_of_adults;
      var no_of_children = req.body.no_of_children;
      var min_price = req.body.min_price;
      var max_price = req.body.max_price;
   
       var FlightBookDetails = new flightBookModule({
           Name: name,
           Phone: phone,
           Email: email,
           Flying_From: flying_from,
           Flying_To: flying_to,
           Arrival_Date: arrival_date,
           Departure_Date: departure_date,
           No_of_Adults: no_of_adults,
           No_of_Children: no_of_children,
           Min_Price: min_price,
           Max_Price: max_price
       });
   
       FlightBookDetails.save(function (err, data) {
         if (err) throw err;
         getcreatePackage.exec((err,data1)=>{
          if(err) throw err;
      res.render('flight_booking', { title: 'WeTravel', loginUser:'', adminUser: adminUser, records: data,record: data1 , success: 'Booked Successfully!!' });
       });
      });
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/book_travels', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    getcreatePackage.exec((err,data1)=>{
      if(err) throw err;
    res.render('travel_book', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record:data1,records:'', success: '' });
  });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      getcreatePackage.exec((err,data1)=>{
        if(err) throw err;
      res.render('travel_book', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record:data1,records:'', success: '' });
    });
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/book_travels', checkLoginUser, function (req, res, next) {
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');

   var name = req.body.name;
   var phone = req.body.phone;
   var email = req.body.email;
   var pickup_loc =req.body.pickup_loc;
   var dropoff_loc = req.body.dropoff_loc;
   var pickup_date =req.body.pickup_date;
   var pickup_time =req.body.pickup_time;
   var dropoff_date =req.body.dropoff_date;
   var dropoff_time =req.body.dropoff_time;
   var car_type =req.body.car_type;
   var total_passengers =req.body.total_passengers;
   var no_of_adults = req.body.no_of_adults;
   var no_of_children = req.body.no_of_children;
   var min_price = req.body.min_price;
   var max_price = req.body.max_price;

    var TravelBookDetails = new travelBookModule({
        Name: name,
        Phone: phone,
        Email: email,
        Pickup_Location: pickup_loc,
        Droppingoff_Location: dropoff_loc,
        Pickup_Date: pickup_date,
        Pickup_Time: pickup_time,
        Dropoff_Date: dropoff_date,
        Dropoff_Time: dropoff_time,
        Car_Type: car_type,
        Total_Passengers: total_passengers,
        No_of_Adults: no_of_adults,
        No_of_Children: no_of_children,
        Min_Price:min_price,
        Max_Price: max_price
    });

    TravelBookDetails.save(function (err, data) {
      if (err) throw err;
      getcreatePackage.exec((err,data1)=>{
        if(err) throw err;
      res.render('travel_book', { title: 'WeTravel', loginUser: loginUser, adminUser:'', records: data,record:data1, success: 'Booked Successfully!!' });
    });
  });
  } else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');

      var name = req.body.name;
      var phone = req.body.phone;
      var email = req.body.email;
      var pickup_loc =req.body.pickup_loc;
      var dropoff_loc = req.body.dropoff_loc;
      var pickup_date =req.body.pickup_date;
      var pickup_time =req.body.pickup_time;
      var dropoff_date =req.body.dropoff_date;
      var dropoff_time =req.body.dropoff_time;
      var car_type =req.body.car_type;
      var total_passengers =req.body.total_passengers;
      var no_of_adults = req.body.no_of_adults;
      var no_of_children = req.body.no_of_children;
      var min_price = req.body.min_price;
      var max_price = req.body.max_price;
   
       var TravelBookDetails = new travelBookModule({
           Name: name,
           Phone: phone,
           Email: email,
           Pickup_Location: pickup_loc,
           Droppingoff_Location: dropoff_loc,
           Pickup_Date: pickup_date,
           Pickup_Time: pickup_time,
           Dropoff_Date: dropoff_date,
           Dropoff_Time: dropoff_time,
           Car_Type: car_type,
           Total_Passengers: total_passengers,
           No_of_Adults: no_of_adults,
           No_of_Children: no_of_children,
           Min_Price:min_price,
           Max_Price: max_price
       });
   
       TravelBookDetails.save(function (err, data) {
         if (err) throw err;
         getcreatePackage.exec((err,data1)=>{
          if(err) throw err;
      res.render('travel_book', { title: 'WeTravel', loginUser:'', adminUser: adminUser, records: data,record: data1, success: 'Booked Successfully!!' });
       });
      });
    }
    else {
      res.redirect('/');
    }
  }
});




















router.get('/tours', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');

    getcreatePackage.exec((err, data) => {
      if (err) throw err;
      res.render('index-tour', { title: 'WeTravel', loginUser: loginUser, adminUser: '', records: data });
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');

      getcreatePackage.exec((err, data) => {
        if (err) throw err;
        res.render('index-tour', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
      });
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/tours/book/:id', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var getid = req.params.id;
    var getcreatedpackagedetails = CreatePackageModule.findById({ _id: getid });
    getcreatedpackagedetails.exec((err, data) => {
      if (err) throw err;
      getpackageDestination.exec((err, data1) => {
    
        res.render('book_package', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record: data1, records: data });
      });
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var getid = req.params.id;
      var getcreatedpackagedetails = CreatePackageModule.findById({ _id: getid });
      getcreatedpackagedetails.exec((err, data) => {
        if (err) throw err;
        getpackageDestination.exec((err, data1) => {
        
          res.render('book_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data1, records: data });
        });
      });
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/tours/places/:id', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var getid = req.params.id;
    var getpackagedestdetails = PackagedestModule.findById({ _id: getid });
    getpackagedestdetails.exec((err, data) => {
      if (err) throw err;
      getcreatePackage.exec((err, data1) => {
    
        res.render('tour_places', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record: data1, records: data });
      });
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var getid = req.params.id;
      var getpackagedestdetails = PackagedestModule.findById({ _id: getid });
       getpackagedestdetails.exec((err, data) => {
        if (err) throw err;
        getcreatePackage.exec((err, data1) => {
          res.render('tour_places', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data1, records: data });
        });
      });
    }
    else {
      res.redirect('/');
    }
  }
});













router.get('/tours/booking/:id', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var getid = req.params.id;
    var getcreatedpackagedetails = CreatePackageModule.findById({ _id: getid });
    getcreatedpackagedetails.exec((err, data) => {
      if (err) throw err;
      getcreatePackage.exec((err,data1)=>{
        if (err) throw err;
        getHotelPackage.exec((err,data2)=>{
        res.render('booking', { title: 'WeTravel', loginUser: loginUser, adminUser: '',records: data,record:'',record1: data1,record2: data2,success:''});
    });
  });
});
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var getid = req.params.id;
      var getcreatedpackagedetails = CreatePackageModule.findById({ _id: getid });
      getcreatedpackagedetails.exec((err, data) => {
        if (err) throw err;
        getcreatePackage.exec((err,data1)=>{
          if (err) throw err;
          getHotelPackage.exec((err,data2)=>{
         res.render('booking', { title: 'WeTravel', loginUser: '', adminUser: adminUser,records: data,record:'',record1: data1,record2: data2,success:'' });
      });
    });
  });
    }
    else {
      res.redirect('/');
    }
  }
});



router.post('/tours/booking/:id', checkLoginUser, function (req, res, next) {
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var name = req.body.name;
    var number = req.body.number;
    var email = req.body.email;
    var location = req.body.location;
    var package_type = req.body.package_type;
    var price = req.body.price;

    var BookingDetails = new BookingModule({
      Name: name,
      Number: number,
      Email: email,
      Location: location,
      Package_Type: package_type,
      Price: price
    });
   
    
        
        BookingDetails.save(function (err, data){
          if (err) throw err;
          getcreatePackage.exec((err,data1)=>{
            if (err) throw err;
            getHotelPackage.exec((err,data2)=>{
      res.render('booking', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record: data,records:'',record1:data1,record2:data2, success: 'Thank you for arranging a wonderful trip for us! Our team will contact you shortly!' });
        });
      });
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var name = req.body.name;
      var number = req.body.number;
      var email = req.body.email;
      var location = req.body.location;
      var package_type = req.body.package_type;
      var price = req.body.price;
  
      var BookingDetails = new BookingModule({
        Name: name,
        Number: number,
        Email: email,
        Location: location,
        Package_Type: package_type,
        Price: price
      });
  
    
     
      BookingDetails.save(function (err, data) {
        if (err) throw err;
        getcreatePackage.exec((err,data1)=>{
          if (err) throw err;
          getHotelPackage.exec((err,data2)=>{
        res.render('booking', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data,records:'',record1:data1,record2:data2, success: 'Thank you for arranging a wonderful trip for us! Our team will contact you shortly!' });
      });
    });
  });
    }
    else {
      res.redirect('/');
    }
  }

});








router.get('/contact', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');

   
      res.render('index-contact', { title: 'WeTravel', loginUser: loginUser, adminUser: '', records:'', success: ''});
 
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');

     
        res.render('index-contact', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records:'', success: ''});
   
    }
    else {
      res.redirect('/');
    }
  }
});




router.post('/contact', checkLoginUser, function (req, res, next) {
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var fullname = req.body.full_name
    var email = req.body.email;
    var message = req.body.message;

    var ContactDetails = new contactModule({
      Full_Name: fullname,
      Email: email,
      Message: message
    });

    ContactDetails.save(function (err, data) {
      if (err) throw err;

      res.render('index-contact', { title: 'WeTravel', loginUser: loginUser, adminUser: '', records: data, success: 'Message Sent' });
    });

  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var fullname = req.body.full_name
      var email = req.body.email;
      var message = req.body.message;

      var ContactDetails = new contactModule({
        Full_Name: fullname,
        Email: email,
        Message: message
      });

      ContactDetails.save(function (err, data) {
        if (err) throw err;

        res.render('index-contact', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Message Sent' });
      });

    }
    else {
      res.redirect('/');
    }
  }

});





router.get('/hotels', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    getHotelPackage.exec((err,data)=>{
      if(err) throw err;
    res.render('index-hotels', { title: 'WeTravel', loginUser: loginUser, adminUser: '', records:data });
  });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
     getHotelPackage.exec((err,data)=>{
        if(err) throw err;
      res.render('index-hotels', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records:data });
    });
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/hotels/:id',checkLoginUser,function(req,res,next){
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var getid = req.params.id;
    var hoteldetails = createHotelModule.findById({_id: getid});
    hoteldetails.exec((err,data)=>{
      if(err) throw err;
    res.render('hotel_package', { title: 'WeTravel', loginUser: loginUser, adminUser: '', records:data });
  });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var getid = req.params.id;
      var hoteldetails = createHotelModule.findById({_id: getid});
      hoteldetails.exec((err,data)=>{
        if(err) throw err;
      res.render('hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records:data });
    });
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/hotels/booking/:id', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var getid = req.params.id;
    var gethoteldetails = createHotelModule.findById({ _id: getid });
    gethoteldetails.exec((err, data) => {
      if (err) throw err;
      getcreatePackage.exec((err,data1)=>{
        if (err) throw err;
        getHotelPackage.exec((err,data2)=>{
          res.render('booking_hotel', { title: 'WeTravel', loginUser: loginUser, adminUser: '',records: data,record:'',record1: data1,record2: data2,success:''});
        });
      });
       
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var getid = req.params.id;
      var gethoteldetails = createHotelModule.findById({ _id: getid });
      gethoteldetails.exec((err, data) => {
        if (err) throw err;
        getcreatePackage.exec((err,data1)=>{
          if (err) throw err;
          getHotelPackage.exec((err,data2)=>{
         res.render('booking_hotel', { title: 'WeTravel', loginUser: '', adminUser: adminUser,records: data,record:'',record1: data1,record2: data2,success:'' });
      });
    });
  });
    }
    else {
      res.redirect('/');
    }
  }
});








router.post('/hotels/booking/:id', checkLoginUser, function (req, res, next) {
  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var name = req.body.name;
    var number = req.body.number;
    var email = req.body.email;
    var hotel_name = req.body.hotel_name;
    var discount = req.body.discount;
    var price = req.body.price;

    var BookingHotelDetails = new bookingHotelModule({
      Name: name,
      Number: number,
      Email: email,
      Hotel_Name: hotel_name,
      Discount: discount,
      Price: price
    });
   
    BookingHotelDetails.save(function (err, data){
          if (err) throw err;
          getcreatePackage.exec((err,data1)=>{
            if (err) throw err;
            getHotelPackage.exec((err,data2)=>{
      res.render('booking_hotel', { title: 'WeTravel', loginUser: loginUser, adminUser: '', record: data,records:'',record1:data1,record2:data2, success: 'Thank you for booking hotel from our site! Our team will contact you shortly!' });
        });
      });
    });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      var name = req.body.name;
      var number = req.body.number;
      var email = req.body.email;
      var hotel_name = req.body.hotel_name;
      var discount = req.body.discount;
      var price = req.body.price;
     
     
      var BookingHotelDetails = new bookingHotelModule({
        Name: name,
        Number: number,
        Email: email,
        Hotel_Name: hotel_name,
        Discount: discount,
        Price: price
      });
  
    
     
      BookingHotelDetails.save(function (err, data){
        if (err) throw err;
        getcreatePackage.exec((err,data1)=>{
          if (err) throw err;
          getHotelPackage.exec((err,data2)=>{
        res.render('booking_hotel', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data,records:'',record1:data1,record2:data2, success: 'Thank you for booking hotel from our site! Our team will contact you shortly!' });
      });
    });
  });
    }
    else {
      res.redirect('/');
    }
  }

});
















router.get('/Blogs', checkLoginUser, function (req, res, next) {

  if (req.session.user) {
    var loginUser = localStorage.getItem('loginUser');
    res.render('index_blogs', { title: 'WeTravel', loginUser: loginUser, adminUser: '' });
  }
  else {
    if (req.session.admin) {
      var adminUser = localStorage.getItem('adminUser');
      res.render('index_blogs', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
    }
    else {
      res.redirect('/');
    }
  }
});

















// Dashboard


router.get('/dashboard', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getpackageCat.exec((err,data)=>{
      if(err) throw err;
      getuser.exec((err,data1)=>{
        if(err) throw err;
        getContact.exec((err,data2)=>{
          if(err) throw err;
          getHotelPackage.exec((err,data3)=>{
          res.render('dashboard', { title: 'WeTravel', loginUser: '', adminUser: adminUser,records: data,record: data1,record1: data2,record2: data3 });
          });
        });
      });
    });
  
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});

router.get('/categories', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('categories', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/categories/destinations', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('destinationCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/categories/destinations/addDestinationCategory', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('add_destination_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: '', success: '' });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/categories/destinations/addDestinationCategory', checkLoginUser, destinationupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');

    var imagename = req.file.filename;
    var destinationname = req.body.dest_name;
    var location = req.body.loc;
    var destinationdesc = req.body.dest_desc;

    var destinationCatDetails = new destinationCatModule({
      destination_name: destinationname,
      location: location,
      destination_description: destinationdesc,
      destination_image: imagename
    });

    destinationCatDetails.save(function (err, data) {
      if (err) throw err;

      res.render('add_destination_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Destination Category Created successfully' });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/categories/destinations/viewDestinationCategory', checkLoginUser, destinationupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getdestinationCat.exec((err, data) => {
      if (err) throw err;
      res.render('view_destination_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/categories/destinations/viewDestinationCategory/edit/:id', checkLoginUser, destinationupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getdestinationdetails = destinationCatModule.findById({ _id: getid });
    getdestinationdetails.exec((err, data) => {
      if (err) throw err;

      res.render('update_destinationCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: '' });
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/categories/destinations/viewDestinationCategory/edit/:id', checkLoginUser, destinationupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getbodyid = req.params.id;

    if (req.file) {
      var datarecords = {
        destination_name: req.body.dest_name,
        location: req.body.loc,
        destination_description: req.body.dest_desc,
        destination_image: req.file.filename,
      }
    } else {
      var datarecords = {
        destination_name: req.body.dest_name,
        location: req.body.loc,
        destination_description: req.body.dest_desc,
      }
    }
    destinationCatModule.findByIdAndUpdate(getbodyid, datarecords).exec((err) => {
      if (err) throw err;
      var updateddestinationdetails = destinationCatModule.findById({ _id: getbodyid });
      updateddestinationdetails.exec((err, data) => {
        if (err) throw err;
        res.render('update_destinationCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: 'Destination Category Updated Successfully' });
      });

    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/categories/destinations/viewDestinationCategory/delete/:id', checkLoginUser, destinationupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getdestinationdetails = destinationCatModule.findByIdAndDelete({ _id: getid });
    getdestinationdetails.exec((err, data) => {
      if (err) throw err;
      res.redirect('/categories/destinations/viewDestinationCategory');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/categories/PackageCategory', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('packageCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/categories/PackageCategory/addPackageCategory', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('add_package_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: '', success: '' });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});

router.post('/categories/PackageCategory/addPackageCategory', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');


    var packagetype = req.body.package_type;


    var packageCatDetails = new packageCatModule({
      Package_Type: packagetype,
    });

    packageCatDetails.save(function (err, data) {
      if (err) throw err;

      res.render('add_package_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Package Category Created successfully' });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/categories/PackageCategory/viewPackageCategory', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getpackageCat.exec((err, data) => {
      if (err) throw err;
      res.render('view_package_category', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/categories/PackageCategory/viewPackageCategory/edit/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getpackagecategorydetails = packageCatModule.findById({ _id: getid });
    getpackagecategorydetails.exec((err, data) => {
      if (err) throw err;

      res.render('update_packageCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: '' });
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/categories/PackageCategory/viewPackageCategory/edit/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getbodyid = req.params.id;
    var packagetype = req.body.package_type;

    packageCatModule.findByIdAndUpdate(getbodyid, { Package_Type: packagetype }).exec((err) => {
      if (err) throw err;
      var updatedpackagecategorydetails = packageCatModule.findById({ _id: getbodyid });
      updatedpackagecategorydetails.exec((err, data) => {
        if (err) throw err;
        res.render('update_packageCategory', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: 'Package Category Updated Successfully' });
      });

    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});

router.get('/categories/PackageCategory/viewPackageCategory/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getpackagecategorydetails = packageCatModule.findByIdAndDelete({ _id: getid });
    getpackagecategorydetails.exec((err, data) => {
      if (err) throw err;
      res.redirect('/categories/PackageCategory/viewPackageCategory');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});









router.get('/packages', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('packages', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/packages/CreatePackage', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getpackageCat.exec((err, data) => {
      res.render('CreatePackage', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: '' });
    });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.post('/packages/CreatePackage', checkLoginUser, packageupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');

    var imagename = req.file.filename;
    var packagename = req.body.package_name;
    var packagetype = req.body.package_type;
    var packageduration = req.body.package_duration;
    var discount = req.body.discount;
    var packageprice = req.body.package_price;
    var packagemap = req.body.package_map;
    var packageloc = req.body.package_loc;
    var packagefeatures = req.body.package_features;
    var packagedetails = req.body.package_details;

    var CreatePackageDetails = new CreatePackageModule({
      Package_name: packagename,
      Package_Type: packagetype,
      Package_Duration: packageduration,
      Discount: discount,
      Package_Price: packageprice,
      Package_map: packagemap,
      Package_location: packageloc,
      Package_features: packagefeatures,
      Package_Details: packagedetails,
      Package_image: imagename
    });

    CreatePackageDetails.save(function (err, doc) {
      getpackageCat.exec((err, data) => {
        if (err) throw err;
        res.render('CreatePackage', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Package Created successfully' });
      });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});




router.get('/packages/ViewPackage', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getcreatePackage.exec((err, data) => {
      if (err) throw err;
      res.render('ViewPackage', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});




router.get('/packages/ViewPackage/edit/:id', checkLoginUser, packageupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getpackagedetails = CreatePackageModule.findById({ _id: getid });
    getpackagedetails.exec((err, data) => {
      if (err) throw err;
      getpackageCat.exec((err, data1) => {
        res.render('UpdatePackage', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, records: data1, success: '' });
      });
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/packages/ViewPackage/edit/:id', checkLoginUser, packageupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getbodyid = req.params.id;

    if (req.file) {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_Type: req.body.package_type,
        Package_Duration: req.body.package_duration,
        Discount: req.body.discount,
        Package_Price: req.body.package_price,
        Package_map: req.body.package_map,
        Package_location: req.body.package_loc,
        Package_features: req.body.package_features,
        Package_Details: req.body.package_details,
        destination_image: req.file.filename
      }
    } else {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_Type: req.body.package_type,
        Package_Duration: req.body.package_duration,
        Discount: req.body.discount,
        Package_Price: req.body.package_price,
        Package_map: req.body.package_map,
        Package_location: req.body.package_loc,
        Package_features: req.body.package_features,
        Package_Details: req.body.package_details
      }
    }
    CreatePackageModule.findByIdAndUpdate(getbodyid, datarecords).exec((err) => {
      if (err) throw err;
      var updatedPackageDetails = CreatePackageModule.findById({ _id: getbodyid });
      updatedPackageDetails.exec((err, data) => {
        if (err) throw err;
        getpackageCat.exec((err, data1) => {
          res.render('UpdatePackage', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, records: data1, success: 'Package Updated Successfully' });
        });
      });
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/ViewPackage/delete/:id', checkLoginUser, packageupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getPackagedelete = CreatePackageModule.findByIdAndDelete({ _id: getid });
    getPackagedelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/packages/ViewPackage');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/CreatePackageDestination', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getcreatePackage.exec((err, data) => {
      res.render('create-package-destination', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: '' });
    });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/packages/CreatePackageDestination', checkLoginUser, packagedestupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');

    var imagename = req.file.filename;
    var packagename = req.body.package_name;
    var packagelocation = req.body.package_loc;
    var packagedescription = req.body.package_desc;

    var PackagedestDetails = new PackagedestModule({
      Package_name: packagename,
      Package_location: packagelocation,
      Description: packagedescription,
      destination_image: imagename
    });

    PackagedestDetails.save(function (err, doc) {
      getpackageCat.exec((err, data) => {
        if (err) throw err;
        res.render('create-package-destination', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Package Destination Created successfully' });
      });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/packages/ViewPackageDestination', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getpackageDestination.exec((err, data) => {
      if (err) throw err;
      res.render('view-package-destination', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/ViewPackageDestination/edit/:id', checkLoginUser, packagedestupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getpackagedestdetails = PackagedestModule.findById({ _id: getid });
    getpackagedestdetails.exec((err, data) => {
      if (err) throw err;
      getcreatePackage.exec((err, data1) => {
        res.render('update-package-destination', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, records: data1, success: '' });
      });
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/packages/ViewPackageDestination/edit/:id', checkLoginUser, packagedestupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getbodyid = req.params.id;

    if (req.file) {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_location: req.body.package_loc,
        Description: req.body.package_desc,
        destination_image: req.file.filename
      }
    } else {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_location: req.body.package_loc,
        Description: req.body.package_desc,
      }
    }
    PackagedestModule.findByIdAndUpdate(getbodyid, datarecords).exec((err) => {
      if (err) throw err;
      var updatedPackagedestDetails = PackagedestModule.findById({ _id: getbodyid });
      updatedPackagedestDetails.exec((err, data) => {
        if (err) throw err;
        getcreatePackage.exec((err, data1) => {
          res.render('update-package-destination', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, records: data1, success: 'Package Destination Updated Successfully' });
        });
      });
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/packages/ViewPackageDestination/delete/:id', checkLoginUser, packagedestupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getPackagedestdelete = PackagedestModule.findByIdAndDelete({ _id: getid });
    getPackagedestdelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/packages/ViewPackageDestination');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});



router.get('/packages/CreateHotelPackage', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
      res.render('create_hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records:'', success: '' });
   
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.post('/packages/CreateHotelPackage', checkLoginUser, packagehotelupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');

    var imagename = req.file.filename;
    var packagename = req.body.package_name;
    var packagelocation = req.body.package_location;
    var packageaddress = req.body.package_address;
    var packageduration = req.body.package_duration;
    var packageprice = req.body.package_price;
    var packageratings = req.body.package_ratings;
    var packagedescription = req.body.package_desc;
    var packagetickets = req.body.package_tickets;
    var discount = req.body.discount;
    var packagemap = req.body.package_map;

    var HotelPackageDetails = new createHotelModule({
      Package_name: packagename,
      Package_location: packagelocation,
      Package_address: packageaddress,
      Package_Duration: packageduration,
      Package_Price: packageprice,
      Ratings: packageratings,
      Package_Description: packagedescription,
      Tickets_available: packagetickets,
      Discount: discount,
      Package_map: packagemap,
      Package_image: imagename
    });

    HotelPackageDetails.save(function (err, data) {
        if (err) throw err;
        res.render('create_hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data, success: 'Hotel Package Created successfully' });
      });
   

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/ViewHotelPackage', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getHotelPackage.exec((err, data) => {
      if (err) throw err;
      res.render('view_hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/ViewHotelPackage/edit/:id', checkLoginUser, packagehotelupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var gethotelpackagedetails = createHotelModule.findById({ _id: getid });
    gethotelpackagedetails.exec((err, data) => {
      if (err) throw err;
    
        res.render('update_hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: '' });
     
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});





router.post('/packages/ViewHotelPackage/edit/:id', checkLoginUser, packagehotelupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getbodyid = req.params.id;

    if (req.file) {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_location: req.body.package_location,
        Package_address: req.body.package_address,
        Package_Duration: req.body.package_duration,
        Package_Price: req.body.package_price,
        Ratings: req.body.package_ratings,
        Package_Description: req.body.package_desc,
        Tickets_available: req.body.package_tickets,
        Discount: req.body.discount,
        Package_map: req.body.package_map,
        Package_image: req.file.filename
      }
    } else {
      var datarecords = {
        Package_name: req.body.package_name,
        Package_location: req.body.package_location,
        Package_address: req.body.package_address,
        Package_Duration: req.body.package_duration,
        Package_Price: req.body.package_price,
        Ratings: req.body.package_ratings,
        Package_Description: req.body.package_desc,
        Tickets_available: req.body.package_tickets,
        Discount: req.body.discount,
        Package_map: req.body.package_map
      }
    }
    createHotelModule.findByIdAndUpdate(getbodyid, datarecords).exec((err) => {
      if (err) throw err;
      var updatedHotelPackageDetails = createHotelModule.findById({ _id: getbodyid });
      updatedHotelPackageDetails.exec((err, data) => {
        if (err) throw err;
          res.render('update_hotel_package', { title: 'WeTravel', loginUser: '', adminUser: adminUser, record: data, success: 'Hotel Package Updated Successfully' });
    
      });
    });
  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/packages/ViewHotelPackage/delete/:id', checkLoginUser, packagehotelupload, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getHotelPackagedelete = createHotelModule.findByIdAndDelete({ _id: getid });
    getHotelPackagedelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/packages/ViewHotelPackage');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});










router.get('/booking_details', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    res.render('admin-booking', { title: 'WeTravel', loginUser: '', adminUser: adminUser });
  }
  else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});

router.get('/booking_details/tour_bookings', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getBooking.exec((err, data) => {
      if (err) throw err;
      res.render('tour_bookings', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/booking_details/tour_bookings/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getbookingdetaildelete = BookingModule.findByIdAndDelete({ _id: getid });
    getbookingdetaildelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/booking_details/tour_bookings');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});




router.get('/booking_details/flight_bookings', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getFlightBooking.exec((err, data) => {
      if (err) throw err;
      res.render('flight_booking_details', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/booking_details/flight_bookings/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getflightbookingdetaildelete = flightBookModule.findByIdAndDelete({ _id: getid });
    getflightbookingdetaildelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/booking_details/flight_bookings');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/booking_details/travel_bookings', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getTravelBooking.exec((err, data) => {
      if (err) throw err;
      res.render('travel_booking_details', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/booking_details/travel_bookings/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var gettravelbookingdetaildelete = travelBookModule.findByIdAndDelete({ _id: getid });
    gettravelbookingdetaildelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/booking_details/travel_bookings');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});




router.get('/booking_details/hotel_bookings', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getHotelBooking.exec((err, data) => {
      if (err) throw err;
      res.render('hotel_booking_details', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/booking_details/hotel_bookings/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var gethotelbookingdetaildelete = bookingHotelModule.findByIdAndDelete({ _id: getid });
    gethotelbookingdetaildelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/booking_details/hotel_bookings');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});
















router.get('/enquiry', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    getContact.exec((err, data) => {
      if (err) throw err;
      res.render('enquiry', { title: 'WeTravel', loginUser: '', adminUser: adminUser, records: data });
    });

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});


router.get('/enquiry/delete/:id', checkLoginUser, function (req, res, next) {
  if (req.session.admin) {
    var adminUser = localStorage.getItem('adminUser');
    var getid = req.params.id;
    var getContactdelete = contactModule.findByIdAndDelete({ _id: getid });
    getContactdelete.exec((err, data) => {
      if (err) throw err;
      res.redirect('/enquiry');
    })

  } else {
    if (req.session.user) {
      res.redirect('/index');
    }
    else {
      res.redirect('/');
    }
  }
});




router.get('/logout', function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      res.redirect('/');
    }

  })

  localStorage.removeItem('adminToken');
  localStorage.removeItem('userToken');
  localStorage.removeItem('adminUser');
  localStorage.removeItem('loginUser');
  res.redirect('/');

});

module.exports = router;
