const asyncHandler = require('express-async-handler');
const places = require('../models/places');

// Get all places => GET api/places
const getAllPlaces = asyncHandler(async (req,res) => {
    const placesList  = await places.find();
    console.log(placesList.length);
    res.status(200).json(placesList);
});

// Create new place => POST api/places/create
const createPlace = asyncHandler(async (req,res) => {
    try {
        
        const data = req.body;
        //console.log(req.body);

        let existingPlace;
        let checkLatLong;

        const {name, location: {province: {provinceId} },latitude,longitude } = req.body;

        checkLatLong = await places.findOne(
            {
                "latitude": latitude,
                "longitude": longitude
            }      
        )

        existingPlace = await places.findOne(
            {
                "name": name,
                "location.province.provinceId": provinceId
            }    
        )

        if(existingPlace || checkLatLong) {
            return res.status(400).json({ message: `Name: ${name} and ${provinceId} already exists`});
        }

        const placeCreated = await places.create(req.body);
        return res.status(200).json(req.body);

    } catch(err) {
        console.log(err);
    }
});

// Delete place => DELETE api/places/delete/:id
const deletePlace = asyncHandler(async (req,res) => {
    try {
        const placeID = req.params.id;
        const deletePlace = await places.findById(placeID);

        if(!deletePlace) {
            return res.status(404).send("Places ID not found!");
        }

        await places.findByIdAndDelete(placeID);

        res.status(200).send({
            message: `Deleted ${placeID} from database!`
        });
    } catch(err) {
        console.log(err);
    }
});

// Get single place => GET api/places/:id
const getSinglePlace = asyncHandler(async (req,res) => {
    try {
        const placeID = req.params.id;

        const targetPlace = await places.findById(placeID);
        if(!targetPlace) {
            return res.status(404).send("Places ID not found!");
        }
        res.status(200).json(targetPlace);
    } catch(err) {
        console.log(err);
    }
});

// Update place => api/places/update/:id

const updatePlace = asyncHandler(async (req,res) => {
    try {
        const placeID = req.params.id;

        let targetPlace = await places.findById(placeID);

        if(!targetPlace) {
            return res.status(404).send("Places ID not found!");
        }

        targetPlace = await places.findByIdAndUpdate(req.params.id, req.body,{
            new: true
        })

        res.status(200).json(targetPlace);
    } catch(err) {
        console.log(err);
    }
});

// Get multiple places that match District  => GET api/places/searchs/data/?province=ราชบุรี&district=เมืองราชบุรี
const searchPlaceByDistrict = asyncHandler(async (req,res) => {
    try {
        const { province,district,subDistrict } = req.query;
        
        let placesList;
        if(province) {
            placesList = await places.find({'location.province.name': province});
        }

        if(district) {
            placesList = await places.find({'location.district.name': district});
        }

        if(subDistrict) {
            placesList = await places.find({'location.subDistrict.name': subDistrict});
        }

        return res.status(200).json(placesList);

    } catch(err) {
        console.log(err);
    }
});


// Delete place => api/places/deleteAll
const deleteAllPlaces = asyncHandler(async (req,res) => {
    await places.deleteMany( { } );

    return res.status(200).json({ message: `Deleted all data!`})
}) 

module.exports = { getAllPlaces, createPlace, deletePlace, getSinglePlace, updatePlace, deleteAllPlaces, searchPlaceByDistrict};